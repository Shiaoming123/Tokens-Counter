# 许可证与计数方式

本项目的 UI 会为每个结果显示 `licenseRef`、准确度等级和计数方式。商业使用前请核对模型厂商官方文档、价格页和许可证。

| 项目 | 许可证/条款 | 用途 | 备注 |
| --- | --- | --- | --- |
| tiktoken / js-tiktoken | MIT | OpenAI 文本 token 计数 | 需要保留版权和许可声明 |
| Anthropic count_tokens API | Vendor API terms | Claude 文本与图片计数 | 需要服务端 `ANTHROPIC_API_KEY` |
| Google GenAI countTokens API | Vendor API terms | Gemini 文本与多模态计数 | 需要服务端 `GEMINI_API_KEY` |
| Mistral tokenizer | Vendor tokenizer/model terms | Mistral 本地 token 近似 | v1 使用 fallback tokenizer，不能标成官方精准 |
| Llama tokenizer files | Meta Llama Community License | Llama token 估算 | 商用和再分发前核对具体模型许可证 |

## 实现约束

1. 不把 Claude / Gemini 的第三方 tokenizer 标成官方。
2. 不把 Llama tokenizer 标成 MIT/Apache。
3. 不缓存用户上传的图片和文本，除非用户主动使用历史记录；历史记录默认只在 LocalStorage。
4. API Key 只从服务端环境变量读取；前端不要求也不保存服务端 Key。
5. Token 和费用均为估算值，实际账单以厂商 API usage 与价格页为准。
