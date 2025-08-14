#!/usr/bin/env tsx

/**
 * 批量处理脚本
 * 功能：一键完成图片转向量和存储到数据库的完整流程
 * 
 * 使用方法：
 *   npx tsx scripts/batch-process.ts <image_directory> <database> <collection> [options]
 */

import { spawn } from 'child_process';
import * as path from 'path';
import { promises as fs } from 'fs';

interface BatchOptions {
  force: boolean;
  batchSize: number;
  skipExisting: boolean;
  skipVectorization: boolean;
  skipDatabase: boolean;
}

/**
 * 执行命令并返回结果
 */
function executeCommand(command: string, args: string[]): Promise<{ success: boolean; output: string }> {
  return new Promise((resolve) => {
    console.log(`🔧 执行命令: ${command} ${args.join(' ')}`);
    
    const process = spawn(command, args, { stdio: 'pipe' });
    let output = '';
    let error = '';
    
    process.stdout?.on('data', (data) => {
      const text = data.toString();
      console.log(text);
      output += text;
    });
    
    process.stderr?.on('data', (data) => {
      const text = data.toString();
      console.error(text);
      error += text;
    });
    
    process.on('close', (code) => {
      resolve({
        success: code === 0,
        output: output + error
      });
    });
  });
}

/**
 * 解析命令行参数
 */
function parseArguments(): { imageDirectory: string; database: string; collection: string; options: BatchOptions } {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.error('❌ 使用方法: npx tsx scripts/batch-process.ts <image_directory> <database> <collection> [options]');
    console.error('选项:');
    console.error('  -f, --force              如果数据库/集合已存在，自动删除重建');
    console.error('  --batch-size <size>      批量插入大小，默认为100');
    console.error('  --skip-existing          跳过已存在的向量');
    console.error('  --skip-vectorization     跳过向量化步骤，直接导入现有向量');
    console.error('  --skip-database          只进行向量化，跳过数据库导入');
    process.exit(1);
  }
  
  const imageDirectory = args[0];
  const database = args[1];
  const collection = args[2];
  
  const options: BatchOptions = {
    force: false,
    batchSize: 100,
    skipExisting: false,
    skipVectorization: false,
    skipDatabase: false
  };
  
  // 解析选项
  for (let i = 3; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '-f':
      case '--force':
        options.force = true;
        break;
      case '--batch-size':
        const batchSize = parseInt(args[++i]);
        if (isNaN(batchSize) || batchSize <= 0) {
          console.error('❌ batch-size 必须是正整数');
          process.exit(1);
        }
        options.batchSize = batchSize;
        break;
      case '--skip-existing':
        options.skipExisting = true;
        break;
      case '--skip-vectorization':
        options.skipVectorization = true;
        break;
      case '--skip-database':
        options.skipDatabase = true;
        break;
      default:
        console.error(`❌ 未知选项: ${arg}`);
        process.exit(1);
    }
  }
  
  return { imageDirectory, database, collection, options };
}

/**
 * 检查目录和文件
 */
async function checkPrerequisites(imageDirectory: string, options: BatchOptions): Promise<void> {
  // 检查图片目录是否存在
  try {
    await fs.access(imageDirectory);
  } catch {
    console.error(`❌ 图片目录不存在: ${imageDirectory}`);
    process.exit(1);
  }
  
  // 如果跳过向量化，检查向量目录是否存在
  if (options.skipVectorization) {
    const vectorDir = path.join(imageDirectory, 'vector');
    try {
      await fs.access(vectorDir);
      const files = await fs.readdir(vectorDir);
      const jsonFiles = files.filter(f => f.endsWith('.json'));
      if (jsonFiles.length === 0) {
        console.error(`❌ 向量目录为空: ${vectorDir}`);
        process.exit(1);
      }
      console.log(`✅ 找到 ${jsonFiles.length} 个向量文件`);
    } catch {
      console.error(`❌ 向量目录不存在: ${vectorDir}`);
      process.exit(1);
    }
  }
}

/**
 * 主函数
 */
async function main(): Promise<void> {
  console.log('🚀 批量处理开始...\n');
  
  // 解析命令行参数
  const { imageDirectory, database, collection, options } = parseArguments();
  
  console.log(`📁 图片目录: ${imageDirectory}`);
  console.log(`🎯 目标数据库: ${database}.${collection}`);
  console.log(`⚙️  处理选项: ${JSON.stringify(options, null, 2)}\n`);
  
  // 检查前置条件
  await checkPrerequisites(imageDirectory, options);
  
  const startTime = Date.now();
  
  try {
    // 步骤1：图片转向量
    if (!options.skipVectorization) {
      console.log('📸 步骤1: 开始图片向量化...');
      const vectorizeResult = await executeCommand('npx', [
        'tsx',
        'scripts/image-to-vector.ts',
        imageDirectory
      ]);
      
      if (!vectorizeResult.success) {
        console.error('❌ 图片向量化失败');
        process.exit(1);
      }
      
      console.log('✅ 图片向量化完成\n');
    } else {
      console.log('⏭️  跳过图片向量化步骤\n');
    }
    
    // 步骤2：向量存储到数据库
    if (!options.skipDatabase) {
      console.log('💾 步骤2: 开始向量数据库存储...');
      
      const vectorDir = path.join(imageDirectory, 'vector');
      const dbArgs = [
        'tsx',
        'scripts/vector-to-db.ts',
        vectorDir,
        database,
        collection
      ];
      
      // 添加选项
      if (options.force) {
        dbArgs.push('-f');
      }
      if (options.skipExisting) {
        dbArgs.push('--skip-existing');
      }
      if (options.batchSize !== 100) {
        dbArgs.push('--batch-size', options.batchSize.toString());
      }
      
      const dbResult = await executeCommand('npx', dbArgs);
      
      if (!dbResult.success) {
        console.error('❌ 向量数据库存储失败');
        process.exit(1);
      }
      
      console.log('✅ 向量数据库存储完成\n');
    } else {
      console.log('⏭️  跳过数据库存储步骤\n');
    }
    
    // 完成统计
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);
    
    console.log('🎉 批量处理完成！');
    console.log(`⏱️  总耗时: ${duration} 秒`);
    console.log(`📊 数据已存储到: ${database}.${collection}`);
    
  } catch (error) {
    console.error('❌ 批量处理失败:', error instanceof Error ? error.message : String(error));
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
