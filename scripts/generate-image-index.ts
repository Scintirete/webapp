#!/usr/bin/env tsx

/**
 * 图片索引生成脚本
 * 功能：读取指定目录下的向量文件，使用 UMAP 进行降维聚类，生成图片位置索引
 * 
 * 使用方法：
 *   npx tsx scripts/generate-image-index.ts <vector_directory> <output_file> [options]
 * 
 * 参数：
 *   vector_directory: 向量JSON文件所在目录
 *   output_file: 输出JSON文件路径
 * 
 * 选项：
 *   --n-neighbors: UMAP邻居数量，默认15
 *   --min-dist: UMAP最小距离，默认0.1
 *   --spread: UMAP扩散值，默认1.0
 *   --n-epochs: UMAP迭代次数，默认200
 *   --verbose: 输出详细日志
 */

import { promises as fs } from 'fs';
import * as path from 'path';
import { UMAP } from 'umap-js';
import { loadEnv, logger, formatDuration, sleep } from './common';

interface VectorData {
  vector: number[];
  img_name: string;
}

interface ImageIndex {
  img_name: string;
  pos: [number, number];
}

interface ScriptOptions {
  nNeighbors: number;
  minDist: number;
  spread: number;
  nEpochs: number;
  verbose: boolean;
}

interface ProcessStats {
  totalFiles: number;
  processedFiles: number;
  failedFiles: number;
  vectorDimension: number;
  umapTime: number;
  outputTime: number;
}

/**
 * 解析命令行参数
 */
function parseArguments(): { vectorDirectory: string; outputFile: string; options: ScriptOptions } {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('❌ 使用方法: npx tsx scripts/generate-image-index.ts <vector_directory> <output_file> [options]');
    console.error('选项:');
    console.error('  --n-neighbors <num>  UMAP邻居数量，默认15');
    console.error('  --min-dist <num>     UMAP最小距离，默认0.1');
    console.error('  --spread <num>       UMAP扩散值，默认1.0');
    console.error('  --n-epochs <num>     UMAP迭代次数，默认200');
    console.error('  --verbose            输出详细日志');
    process.exit(1);
  }
  
  const vectorDirectory = args[0];
  const outputFile = args[1];
  
  const options: ScriptOptions = {
    nNeighbors: 15,
    minDist: 0.1,
    spread: 1.0,
    nEpochs: 200,
    verbose: false
  };
  
  // 解析选项
  for (let i = 2; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--n-neighbors':
        const nNeighbors = parseInt(args[++i]);
        if (isNaN(nNeighbors) || nNeighbors <= 0) {
          console.error('❌ n-neighbors 必须是正整数');
          process.exit(1);
        }
        options.nNeighbors = nNeighbors;
        break;
      case '--min-dist':
        const minDist = parseFloat(args[++i]);
        if (isNaN(minDist) || minDist < 0) {
          console.error('❌ min-dist 必须是非负数');
          process.exit(1);
        }
        options.minDist = minDist;
        break;
      case '--spread':
        const spread = parseFloat(args[++i]);
        if (isNaN(spread) || spread <= 0) {
          console.error('❌ spread 必须是正数');
          process.exit(1);
        }
        options.spread = spread;
        break;
      case '--n-epochs':
        const nEpochs = parseInt(args[++i]);
        if (isNaN(nEpochs) || nEpochs <= 0) {
          console.error('❌ n-epochs 必须是正整数');
          process.exit(1);
        }
        options.nEpochs = nEpochs;
        break;
      case '--verbose':
        options.verbose = true;
        break;
      default:
        console.error(`❌ 未知选项: ${arg}`);
        process.exit(1);
    }
  }
  
  return { vectorDirectory, outputFile, options };
}

/**
 * 扫描目录获取所有向量JSON文件
 */
async function getVectorFiles(directory: string): Promise<string[]> {
  try {
    const files = await fs.readdir(directory);
    const jsonFiles = files
      .filter(file => file.toLowerCase().endsWith('.json'))
      .map(file => path.join(directory, file))
      .sort(); // 排序确保一致的处理顺序
    return jsonFiles;
  } catch (error) {
    throw new Error(`扫描向量目录失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 读取向量JSON文件
 */
async function readVectorFile(filePath: string): Promise<VectorData> {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(content) as VectorData;
    
    // 验证数据格式
    if (!Array.isArray(data.vector) || typeof data.img_name !== 'string') {
      throw new Error('向量数据格式无效');
    }
    
    return data;
  } catch (error) {
    throw new Error(`读取向量文件失败 ${path.basename(filePath)}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 批量读取向量文件
 */
async function loadVectorData(vectorFiles: string[], verbose: boolean): Promise<{ vectors: number[][]; imageNames: string[]; stats: Partial<ProcessStats> }> {
  const vectors: number[][] = [];
  const imageNames: string[] = [];
  let processedFiles = 0;
  let failedFiles = 0;
  let vectorDimension = 0;
  
  logger.info(`📂 开始读取 ${vectorFiles.length} 个向量文件...`);
  
  for (const filePath of vectorFiles) {
    try {
      const vectorData = await readVectorFile(filePath);
      
      // 检查向量维度一致性
      if (vectorDimension === 0) {
        vectorDimension = vectorData.vector.length;
        if (verbose) {
          logger.info(`🔍 检测到向量维度: ${vectorDimension}`);
        }
      } else if (vectorData.vector.length !== vectorDimension) {
        throw new Error(`向量维度不一致: 期望 ${vectorDimension}，实际 ${vectorData.vector.length}`);
      }
      
      vectors.push(vectorData.vector);
      imageNames.push(vectorData.img_name);
      processedFiles++;
      
      if (verbose && processedFiles % 50 === 0) {
        logger.info(`📊 已处理 ${processedFiles}/${vectorFiles.length} 个文件`);
      }
    } catch (error) {
      failedFiles++;
      console.error(`❌ 读取文件失败 ${path.basename(filePath)}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  if (processedFiles === 0) {
    throw new Error('没有成功读取任何向量文件');
  }
  
  logger.success(`✅ 成功读取 ${processedFiles} 个向量文件，失败 ${failedFiles} 个`);
  
  return {
    vectors,
    imageNames,
    stats: {
      totalFiles: vectorFiles.length,
      processedFiles,
      failedFiles,
      vectorDimension
    }
  };
}

/**
 * 使用 UMAP 进行降维
 */
async function performUMAP(vectors: number[][], options: ScriptOptions): Promise<number[][]> {
  const startTime = Date.now();
  
  logger.info('🧮 开始 UMAP 降维处理...');
  logger.info(`📋 UMAP 参数: nNeighbors=${options.nNeighbors}, minDist=${options.minDist}, spread=${options.spread}, nEpochs=${options.nEpochs}`);
  
  try {
    // 配置 UMAP 参数
    const umap = new UMAP({
      nComponents: 2,           // 降维到 2D
      nNeighbors: options.nNeighbors,
      minDist: options.minDist,
      spread: options.spread,
      nEpochs: options.nEpochs,
      random: Math.random,      // 使用标准随机数生成器
    });

    // 使用异步拟合以便提供进度反馈
    const embedding = await umap.fitAsync(vectors, (epochNumber) => {
      if (options.verbose && epochNumber % 20 === 0) {
        const progress = ((epochNumber / options.nEpochs) * 100).toFixed(1);
        logger.info(`🔄 UMAP 进度: ${epochNumber}/${options.nEpochs} (${progress}%)`);
      }
      return true; // 继续处理
    });

    const duration = Date.now() - startTime;
    logger.success(`✅ UMAP 降维完成，耗时: ${formatDuration(duration)}`);
    
    return embedding;
  } catch (error) {
    throw new Error(`UMAP 降维失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 归一化坐标到 [0, 1] 范围
 */
function normalizeCoordinates(embedding: number[][]): number[][] {
  if (embedding.length === 0) {
    return [];
  }
  
  // 找到最小值和最大值
  let minX = embedding[0][0];
  let maxX = embedding[0][0];
  let minY = embedding[0][1];
  let maxY = embedding[0][1];
  
  for (const point of embedding) {
    minX = Math.min(minX, point[0]);
    maxX = Math.max(maxX, point[0]);
    minY = Math.min(minY, point[1]);
    maxY = Math.max(maxY, point[1]);
  }
  
  // 计算范围
  const rangeX = maxX - minX;
  const rangeY = maxY - minY;
  
  // 归一化
  return embedding.map(point => [
    rangeX === 0 ? 0.5 : (point[0] - minX) / rangeX,
    rangeY === 0 ? 0.5 : (point[1] - minY) / rangeY
  ]);
}

/**
 * 生成图片索引
 */
function generateImageIndex(imageNames: string[], normalizedEmbedding: number[][]): ImageIndex[] {
  if (imageNames.length !== normalizedEmbedding.length) {
    throw new Error('图片名称数量与嵌入向量数量不匹配');
  }
  
  return imageNames.map((imgName, index) => ({
    img_name: imgName,
    pos: [normalizedEmbedding[index][0], normalizedEmbedding[index][1]] as [number, number]
  }));
}

/**
 * 保存输出文件
 */
async function saveOutput(imageIndex: ImageIndex[], outputFile: string): Promise<void> {
  const startTime = Date.now();
  
  try {
    // 确保输出目录存在
    const outputDir = path.dirname(outputFile);
    await fs.mkdir(outputDir, { recursive: true });
    
    // 生成JSON内容
    const jsonContent = JSON.stringify(imageIndex, null, 2);
    
    // 写入文件
    await fs.writeFile(outputFile, jsonContent, 'utf8');
    
    const duration = Date.now() - startTime;
    const fileSize = (Buffer.byteLength(jsonContent, 'utf8') / 1024).toFixed(2);
    
    logger.success(`✅ 索引文件已保存: ${outputFile}`);
    logger.info(`📄 文件大小: ${fileSize} KB，耗时: ${formatDuration(duration)}`);
  } catch (error) {
    throw new Error(`保存输出文件失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 输出统计信息
 */
function printStatistics(stats: ProcessStats): void {
  console.log('\n📊 处理统计:');
  logger.info(`总文件数: ${stats.totalFiles}`);
  logger.success(`处理成功: ${stats.processedFiles}`);
  if (stats.failedFiles > 0) {
    logger.error(`处理失败: ${stats.failedFiles}`);
  }
  logger.info(`向量维度: ${stats.vectorDimension}`);
  logger.info(`UMAP 耗时: ${formatDuration(stats.umapTime)}`);
  logger.info(`输出耗时: ${formatDuration(stats.outputTime)}`);
  logger.info(`总耗时: ${formatDuration(stats.umapTime + stats.outputTime)}`);
}

/**
 * 主函数
 */
async function main(): Promise<void> {
  const overallStartTime = Date.now();
  
  try {
    // 加载环境变量
    await loadEnv();
    
    // 解析命令行参数
    const { vectorDirectory, outputFile, options } = parseArguments();
    
    // 检查向量目录是否存在
    try {
      await fs.access(vectorDirectory);
    } catch {
      logger.error(`向量目录不存在: ${vectorDirectory}`);
      process.exit(1);
    }
    
    logger.info(`🚀 开始生成图片索引`);
    logger.info(`📂 向量目录: ${vectorDirectory}`);
    logger.info(`📄 输出文件: ${outputFile}`);
    if (options.verbose) {
      logger.info(`🔧 详细模式已启用`);
    }
    
    // 扫描向量文件
    const vectorFiles = await getVectorFiles(vectorDirectory);
    if (vectorFiles.length === 0) {
      logger.info('未找到向量文件');
      return;
    }
    
    // 读取向量数据
    const { vectors, imageNames, stats: loadStats } = await loadVectorData(vectorFiles, options.verbose);
    
    // 执行 UMAP 降维
    const umapStartTime = Date.now();
    const embedding = await performUMAP(vectors, options);
    const umapTime = Date.now() - umapStartTime;
    
    // 归一化坐标
    logger.info('📐 归一化坐标...');
    const normalizedEmbedding = normalizeCoordinates(embedding);
    
    // 生成图片索引
    logger.info('🗂️ 生成图片索引...');
    const imageIndex = generateImageIndex(imageNames, normalizedEmbedding);
    
    // 保存输出
    const outputStartTime = Date.now();
    await saveOutput(imageIndex, outputFile);
    const outputTime = Date.now() - outputStartTime;
    
    // 输出统计信息
    const finalStats: ProcessStats = {
      totalFiles: loadStats.totalFiles || 0,
      processedFiles: loadStats.processedFiles || 0,
      failedFiles: loadStats.failedFiles || 0,
      vectorDimension: loadStats.vectorDimension || 0,
      umapTime,
      outputTime
    };
    
    printStatistics(finalStats);
    
    const overallDuration = Date.now() - overallStartTime;
    logger.success(`🎉 图片索引生成完成！总耗时: ${formatDuration(overallDuration)}`);
    
  } catch (error) {
    console.error('❌ 程序执行失败:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// 执行主函数
if (require.main === module) {
  main().catch(error => {
    console.error('❌ 未捕获的错误:', error);
    process.exit(1);
  });
}
