/**
 * 从代码块中提取 JSON 内容的工具函数
 */

export const extractJsonFromCodeBlock = (str: string): string => {
  if (!str) return str;
  
  // 处理 ```json 代码块
  if (str.includes('```json')) {
    const parts = str.split('```json');
    if (parts.length > 1) {
      return parts[1].split('```')[0].trim();
    }
  }
  
  // 处理普通 ``` 代码块
  if (str.includes('```')) {
    const parts = str.split('```');
    if (parts.length > 1) {
      return parts[1].trim();
    }
  }
  
  return str;
}; 