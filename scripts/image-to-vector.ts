#!/usr/bin/env tsx

/**
 * 图片转向量脚本
 * 功能：将指定目录下的所有 .jpg 图片转换为向量，并保存为 JSON 格式
 * 
 * 使用方法：
 *   npx tsx scripts/image-to-vector.ts <directory>
 * 
 * 特性：
 *   - 支持断点续跑：自动跳过已生成向量文件的图片
 *   - 智能过滤：在处理前就排除已处理文件，提高效率
 *   - 详细统计：显示总文件数、跳过数量、处理结果等
 * 
 * 输出格式：
 *   - 在输入目录下创建 vector/ 子目录
 *   - 为每个图片生成对应的 {name}.json 文件
 *   - JSON 格式：{ vector: number[], img_name: string }
 */

import { promises as fs } from 'fs';
import * as path from 'path';
import { getDoubaoEmbeddingClient } from '../src/lib/embedding';
import { loadEnv, validateRequiredEnv, logger, formatDuration } from './common';

interface VectorData {
  vector: number[];
  img_name: string;
}

/**
 * 将图片文件转换为 base64 格式
 */
async function imageToBase64(imagePath: string): Promise<string> {
  try {
    const imageBuffer = await fs.readFile(imagePath);
    const base64String = imageBuffer.toString('base64');
    const mimeType = 'image/jpeg';
    return `data:${mimeType};base64,${base64String}`;
  } catch (error) {
    throw new Error(`读取图片文件失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 使用 Doubao API 将图片转换为向量
 */
async function imageToVector(imagePath: string): Promise<number[]> {
  try {
    console.log(`📸 正在处理图片: ${path.basename(imagePath)}`);
    
    // 获取 embedding 客户端
    const embeddingClient = getDoubaoEmbeddingClient();
    
    // 将图片转换为 base64
    const base64Image = await imageToBase64(imagePath);
    
    // 调用 Doubao Embedding API
    const response = await embeddingClient.embedding({
      model: 'doubao-embedding-vision-250615',
      input: [{
        type: 'image_url',
        image_url: {
          url: base64Image
        }
      }]
    });
    
    return response.data.embedding;
  } catch (error) {
    console.error(`❌ 图片转向量失败 ${path.basename(imagePath)}: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

/**
 * 保存向量数据为 JSON 文件
 */
async function saveVectorToJson(vector: number[], imageName: string, outputPath: string): Promise<void> {
  try {
    const vectorData: VectorData = {
      vector: vector,
      img_name: imageName
    };
    
    await fs.writeFile(outputPath, JSON.stringify(vectorData, null, 2), 'utf8');
    console.log(`✅ 向量已保存: ${path.basename(outputPath)}`);
  } catch (error) {
    console.error(`❌ 保存向量文件失败 ${outputPath}: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

/**
 * 扫描目录获取所有 .jpg 文件
 */
async function getJpgFiles(directory: string): Promise<string[]> {
  try {
    const files = await fs.readdir(directory);
    const jpgFiles = files.filter(file => 
      file.toLowerCase().endsWith('.jpg') || file.toLowerCase().endsWith('.jpeg')
    );
    
    return jpgFiles.map(file => path.join(directory, file));
  } catch (error) {
    throw new Error(`扫描目录失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 过滤掉已经生成向量文件的图片，支持断点续跑
 */
async function filterUnprocessedFiles(jpgFiles: string[], vectorDir: string): Promise<{ unprocessed: string[], skipped: string[] }> {
  const unprocessed: string[] = [];
  const skipped: string[] = [];
  
  for (const imagePath of jpgFiles) {
    const imageName = path.basename(imagePath);
    const nameWithoutExt = path.parse(imageName).name;
    const vectorPath = path.join(vectorDir, `${nameWithoutExt}.json`);
    
    try {
      // 检查对应的JSON文件是否存在
      await fs.access(vectorPath);
      skipped.push(imagePath);
    } catch {
      // JSON文件不存在，需要处理
      unprocessed.push(imagePath);
    }
  }
  
  return { unprocessed, skipped };
}

/**
 * 确保向量输出目录存在
 */
async function ensureVectorDirectory(directory: string): Promise<string> {
  const vectorDir = path.join(directory, 'vector');
  try {
    await fs.access(vectorDir);
  } catch {
    await fs.mkdir(vectorDir, { recursive: true });
    console.log(`📁 创建向量目录: ${vectorDir}`);
  }
  return vectorDir;
}

/**
 * 处理单个图片文件
 */
async function processImage(imagePath: string, vectorDir: string): Promise<boolean> {
  try {
    const imageName = path.basename(imagePath);
    const nameWithoutExt = path.parse(imageName).name;
    const outputPath = path.join(vectorDir, `${nameWithoutExt}.json`);
    
    // 转换图片为向量
    const vector = await imageToVector(imagePath);
    
    // 保存向量数据
    await saveVectorToJson(vector, imageName, outputPath);
    
    return true;
  } catch (error) {
    console.error(`❌ 处理图片失败 ${path.basename(imagePath)}: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

/**
 * 主函数
 */
async function main(): Promise<void> {
  const startTime = Date.now();
  
  try {
    // 加载环境变量
    await loadEnv();
    
    // 验证必需的环境变量
    validateRequiredEnv(['ARK_API_KEY']);
    
    // 检查命令行参数
    const args = process.argv.slice(2);
    if (args.length !== 1) {
      logger.error('使用方法: npx tsx scripts/image-to-vector.ts <directory>');
      process.exit(1);
    }
    
    const inputDirectory = args[0];
    
    // 检查目录是否存在
    try {
      await fs.access(inputDirectory);
    } catch {
      logger.error(`目录不存在: ${inputDirectory}`);
      process.exit(1);
    }
    
    logger.info(`开始处理目录: ${inputDirectory}`);
    
    // 初始化 Doubao Embedding 客户端
    logger.info('初始化 Doubao Embedding 客户端...');
    const embeddingClient = getDoubaoEmbeddingClient();
    
    // 测试连接
    const healthCheck = await embeddingClient.healthCheck();
    if (!healthCheck.success) {
      logger.error(`Doubao Embedding 客户端连接失败: ${healthCheck.message}`);
      process.exit(1);
    }
    logger.success('Doubao Embedding 客户端连接正常');
    
    // 扫描 JPG 文件
    logger.info('扫描 JPG 文件...');
    const allJpgFiles = await getJpgFiles(inputDirectory);
    
    if (allJpgFiles.length === 0) {
      logger.info('未找到 JPG 文件');
      return;
    }
    
    logger.info(`找到 ${allJpgFiles.length} 个 JPG 文件`);
    
    // 确保向量目录存在
    const vectorDir = await ensureVectorDirectory(inputDirectory);
    
    // 过滤已处理的文件，支持断点续跑
    logger.info('检查已处理的文件...');
    const { unprocessed, skipped } = await filterUnprocessedFiles(allJpgFiles, vectorDir);
    
    if (skipped.length > 0) {
      logger.info(`跳过 ${skipped.length} 个已处理的文件`);
    }
    
    if (unprocessed.length === 0) {
      logger.success('所有文件都已处理完成！');
      return;
    }
    
    logger.info(`需要处理 ${unprocessed.length} 个文件（跳过 ${skipped.length} 个已处理文件）`);
    
    // 处理未处理的图片文件
    let successCount = 0;
    let failCount = 0;
    
    logger.info('开始批量处理图片...');
    
    for (let i = 0; i < unprocessed.length; i++) {
      const imagePath = unprocessed[i];
      logger.progress(i + 1, unprocessed.length, `处理: ${path.basename(imagePath)}`);
      
      const success = await processImage(imagePath, vectorDir);
      if (success) {
        successCount++;
      } else {
        failCount++;
      }
      
      // // 添加小延迟避免 API 限流
      // if (i < unprocessed.length - 1) {
      //   await new Promise(resolve => setTimeout(resolve, 100));
      // }
    }
    
    // 输出统计信息
    const duration = Date.now() - startTime;
    console.log('\n📊 处理完成统计:');
    logger.info(`总文件: ${allJpgFiles.length} 个`);
    if (skipped.length > 0) {
      logger.info(`跳过已处理: ${skipped.length} 个`);
    }
    logger.success(`本次处理成功: ${successCount} 个`);
    if (failCount > 0) {
      logger.error(`本次处理失败: ${failCount} 个`);
    }
    logger.info(`向量文件保存至: ${vectorDir}`);
    logger.info(`总耗时: ${formatDuration(duration)}`);
    
    if (failCount > 0) {
      logger.warn('存在处理失败的文件，请检查日志');
      process.exit(1);
    }
    
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
