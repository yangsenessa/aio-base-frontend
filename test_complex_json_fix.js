// 简化版fixSpecificJsonIssues函数（与SiliconFlowProvider保持同步）
function fixSpecificJsonIssues(text) {
  let fixed = text;
  // 复杂转义和$符号预处理
  if (fixed.includes('\\\\\\"') || fixed.includes('$')) {
    // 修复三重反斜杠
    fixed = fixed.replace(/\\\\\\"/g, '\\"');
    // 修复属性名带$符号
    fixed = fixed.replace(/\\"([^"\\]+)\\\$\$?:/g, '\\"$1\\":');
    // 修复值中的\$:
    fixed = fixed.replace(/\\\$:/g, '\\":');
    // 清理结构中的$符号
    fixed = fixed.replace(/(["\w])\$([:\],}])/g, '$1$2');
  }
  // 全量转义引号修正
  let normalized = fixed.replace(/\\"/g, '"');
  // 新增：修复属性值中混合单双引号和多余引号
  // 1. 合并被错误拆分的字符串
  normalized = normalized.replace(/"([^"]*)",\s*'([^']*)'\)""/g, '"$1, $2)"');
  // 2. 去除属性值结尾多余引号
  normalized = normalized.replace(/":\s*"([^"]*)""/g, '": "$1"');
  // 3. 去除所有属性值中连续的多余引号
  normalized = normalized.replace(/"""/g, '"');
  try {
    JSON.parse(normalized);
    return normalized;
  } catch (error) {
    // 行级修正
    const lines = fixed.split('\n');
    const fixedLines = lines.map(line => {
      let fixedLine = line;
      if (fixedLine.includes('$')) {
        fixedLine = fixedLine.replace(/\\"([^"\\]*)\\\$(\s*[:}],])/g, '\\"$1\\"$2');
        fixedLine = fixedLine.replace(/\\"([^"\\]*)\$(\s*[:}],])/g, '\\"$1\\"$2');
      }
      fixedLine = fixedLine.replace(/\\"([^"\\]+)\\"(\s*:)/g, '"$1"$2');
      fixedLine = fixedLine.replace(/:\s*\\"([^"\\]*)\\"(?=\s*[,\]\}])/g, ': "$1"');
      fixedLine = fixedLine.replace(/\\"([^"\\]*)\\"(?=\s*[,\]\}:])/g, '"$1"');
      if (fixedLine.includes('\\"') && /\\"[^"]*[}\],]/g.test(fixedLine)) {
        fixedLine = fixedLine.replace(/\\"([^"\\]*?)([}\],])/g, '"$1"$2');
      }
      const incompleteMatches = fixedLine.match(/\\"[^"]*$/g);
      if (incompleteMatches) {
        const afterIncomplete = fixedLine.substring(fixedLine.lastIndexOf('\\"'));
        const nextStructureChar = afterIncomplete.search(/[}\],]/);
        if (nextStructureChar > 0) {
          const beforeStructure = afterIncomplete.substring(0, nextStructureChar);
          const afterStructure = afterIncomplete.substring(nextStructureChar);
          fixedLine = fixedLine.substring(0, fixedLine.lastIndexOf('\\"')) + beforeStructure.replace(/\\"/, '"') + '"' + afterStructure;
        } else {
          if (!fixedLine.trimRight().endsWith('"') && !fixedLine.trimRight().endsWith('",') && !fixedLine.trimRight().endsWith('"}')) {
            fixedLine = fixedLine.replace(/\\"([^"]*)$/, '"$1"');
          }
        }
      }
      // 新增：行级修复多余引号
      fixedLine = fixedLine.replace(/":\s*"([^"]*)""/g, '": "$1"');
      fixedLine = fixedLine.replace(/"""/g, '"');
      return fixedLine;
    });
    fixed = fixedLines.join('\n');
    if (fixed.includes('\\"')) {
      fixed = fixed.replace(/\\"/g, '"');
    }
    return fixed;
  }
}

// 新的复杂错误JSON
const errorJson = `{
  "description": "This MCP enables text-to-image generation using natural language prompts. It accepts user-defined prompt text and returns a generated image based on the described content.",
  "capability_tags": ["image", "enhancement", "filter", "processing"],
  "functional_keywords": ["generate_image", "text_prompt", "image generation", "aesthetic enhancement"],
  "scenario_phrases": ["AI-generated images for branding/design", "Post-processing aesthetic agents", "Text-to-image visual storytelling"],
  "methods": [
    {
      "name": "help",
      "description": "Show this help information.",
      "inputSchema": {
        "type": "object",
        "properties": {
          "prompt": {
            "type": "string",
            "description": "Image generation prompt"
          },
          "negative_prompt": {
            "type": "string",
            "description": "Negative prompt"
          },
          "num_inference_steps": {
            "type": "integer",
            "description": "Number of inference steps",
            "default": 20
          },
          "guidance_scale": {
            "type": "number",
            "description": "Guidance scale",
            "default": 7.5
          },
          "seed": {
            "type": "integer",
            "description": "Random seed"
          },
          "image_size": {
            "type": "string",
            \"description\": \"Image size (e.g., '1024x1024')\",
            \"default\": \"1024x1024\"
          }
        },
        \"required\": ["prompt"]
      },
      \"parameters\": ["prompt", "negative_prompt", "num_inference_steps", "guidance_scale", "seed", "image_size"]
    },
    {
      \"name\": \"generate_image\",
      \"description\": \"Generate image from text prompt\",
      \"inputSchema\": {
        \"type\": \"object\",
        \"properties\": {
          \"prompt\": {
            \"type\": \"string\",
            \"description\": \"Image generation prompt\"
          },
          \"negative_prompt\": {
            \"type\": \"string\",
            \"description\": \"Negative prompt\"
          },
          \"num_inference_steps\": {
            \"type\": \"integer\",
            \"description\": \"Number of inference steps\",
            \"default\": 20
          },
          \"guidance_scale\": {
            \"type\": \"number\",
            \"description\": \"Guidance scale\",
            \"default\": 7.5
          },
          \"seed\": {
            \"type\": \"integer\",
            \"description\": \"Random seed\"
          },
          \"image_size\": {
            \"type\": \"string\",
            \\\"description\\\$: \\\"Image size (e.g., '1024x1024')\\\"\",
            \\\"default\\\$: \\\"1024x1024\\\"\"
          }
        },
        \\\"required\\\$: [\"prompt\"]
      },
      \\\"parameters\\\$: [\"prompt\", \"negative_prompt\", \\\"num_inference_steps\\\", \\\"guidance_scale\\\", \\\"seed\\\", \\\"image_size\\\"]
    }
  ],
  \\\"source\\\$: {
    \\\"author\\\$: \\\"AIO-2030\\\"\",
    \\\"version\\\$: \\\"1.0.0\\\"\",
    \\\"github\\\$: \\\"https://github.com/AIO-2030/mcp_image_generate\\\"\"
  },
  \\\"evaluation_metrics\\\$: {
    \\\"completeness_score\\\$: 0.8,
    \\\"accuracy_score\\\$: 0.8,
    \\\"relevance_score\\\$: 0.8,
    \\\"translation_quality\\\$: 0.8
  }
}`;

console.log('🧪 测试复杂错误JSON修正...');
const fixed = fixSpecificJsonIssues(errorJson);
console.log('\n🔧 修正后:');
console.log(fixed);
try {
  const parsed = JSON.parse(fixed);
  console.log('\n✅ 修正成功，JSON有效！');
} catch (e) {
  console.log('\n❌ 修正失败，JSON无效！', e.message);
} 