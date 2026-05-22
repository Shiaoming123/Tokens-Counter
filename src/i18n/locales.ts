export const translations: Record<string, { en: string; zh: string }> = {
  // ── App / Header ──────────────────────────────────────────────────
  'app.title': { en: 'Token Counter', zh: 'Token 点钞机' },
  'nav.workbench': { en: 'Workbench', zh: '工作台' },
  'nav.licenses': { en: 'Licenses', zh: '许可证' },
  'nav.apiDocs': { en: 'API Docs', zh: 'API 文档' },
  'nav.trust': { en: 'Trust', zh: '可信边界' },
  'nav.earlyAccess': { en: 'Early Access', zh: '抢先试用' },

  // ── Welcome Dialog ────────────────────────────────────────────────
  'welcome.title': { en: 'Thanks for supporting AI Token Counter', zh: '感谢支持 AI Token Counter' },
  'welcome.kaomoji': { en: '(^_^)', zh: '(^_^)' },
  'welcome.intro': {
    en: 'This project helps you estimate token usage and API cost across different AI models for text, images, PDFs, and tool calls.',
    zh: '这个项目可以帮你估算不同 AI 模型在文本、图片、PDF 和工具调用里的 Token 数量与 API 费用。',
  },
  'welcome.stepModels': {
    en: 'Choose the models you want to compare from the model list.',
    zh: '先在模型列表里选择你想对比的模型。',
  },
  'welcome.stepInput': {
    en: 'Paste text, add multi-turn messages, upload images or PDFs, or define tools.',
    zh: '然后粘贴文本、填写多轮对话、上传图片或 PDF，也可以定义工具调用。',
  },
  'welcome.stepEstimate': {
    en: 'Click Estimate cost to see token counts, cost estimates, and accuracy labels. (｀・ω・´)',
    zh: '点击估算费用，就能看到 Token 数、费用预估和精度标签。(｀・ω・´)',
  },
  'welcome.githubLabel': { en: 'GitHub repository', zh: 'GitHub 仓库' },
  'welcome.star': {
    en: 'Stars are very welcome if this little project helps you. (^人^)',
    zh: '欢迎大家来点 Star，给这个小项目一点鼓励。(^人^)',
  },
  'welcome.emailLabel': { en: 'Personal email', zh: '个人邮箱' },
  'welcome.emailNote': {
    en: 'If you need help, feel free to write. If you do not need help, you can still email me to say this project helped you, and I will be so happy I cannot sleep for three days. (≧▽≦)',
    zh: '有需要咨询的朋友欢迎来信；没有需要也可以发邮件告诉我这个项目帮到了你，那我也会高兴得三天睡不着觉。(≧▽≦)',
  },
  'welcome.close': { en: 'Got it, start using (^_^)', zh: '知道啦，开始使用 (^_^)' },
  'welcome.reopen': { en: 'Show welcome guide again', zh: '再次查看欢迎说明' },

  // ── Hero ──────────────────────────────────────────────────────────
  'hero.title': { en: 'Estimate tokens & API cost', zh: '估算 Token 数量与 API 费用' },
  'hero.subtitle': { en: 'Compare 20+ AI models for text, image, PDF and tool calls.', zh: '比较 20+ AI 模型的文本、图片、PDF 和工具调用。' },

  // ── Summary Cards ─────────────────────────────────────────────────
  'summary.totalInput': { en: 'Total Input Tokens', zh: '总输入 Token' },
  'summary.lowestEstimate': { en: 'Lowest Estimate', zh: '最低预估' },
  'summary.highestModel': { en: 'Highest Input Model', zh: '最高输入模型' },
  'summary.modelsSelected': { en: 'Models Selected', zh: '已选模型' },

  // ── Settings Panel ────────────────────────────────────────────────
  'settings.eyebrow': { en: 'Settings', zh: '设置' },
  'settings.title': { en: 'Estimate Settings', zh: '估算设置' },
  'settings.imageDetail': { en: 'Image Detail', zh: '图片精度' },
  'settings.imageDetailHelp': { en: 'Resolution for image token estimation', zh: '图片 Token 估算的分辨率' },
  'settings.outputTokens': { en: 'Output Tokens', zh: '输出 Token' },
  'settings.outputTokensHelp': { en: 'Estimated response length for cost calculation', zh: '用于费用计算的预估回复长度' },
  'settings.officialApi': { en: 'Official API', zh: '官方 API' },
  'settings.officialApiHelp': { en: 'Use provider API for exact token counts', zh: '使用供应商 API 获取精确 Token 数' },
  'settings.cacheHit': { en: 'Cache Hit Tokens', zh: '缓存命中 Token' },
  'settings.cacheHitHelp': { en: 'Tokens read from prompt cache', zh: '从提示缓存读取的 Token' },
  'settings.cacheWrite': { en: 'Cache Write Tokens', zh: '缓存写入 Token' },
  'settings.cacheWriteHelp': { en: 'Tokens written to prompt cache', zh: '写入提示缓存的 Token' },
  'settings.costMultiplier': { en: 'Cost Multiplier', zh: '费用倍数' },
  'settings.costMultiplierHelp': { en: 'Scale factor applied to final cost', zh: '应用于最终费用的缩放因子' },
  'settings.moreSettings': { en: 'More settings', zh: '更多设置' },
  'pricing.profile': { en: 'Pricing Rule', zh: '计费规则' },
  'pricing.official': { en: 'Official / catalog', zh: '官方 / 目录价' },
  'pricing.ccswitch': { en: 'CC Switch preset', zh: 'CC Switch 预设价' },
  'pricing.profileHelp': { en: 'Use this when proxy or coding-tool billing differs from provider pricing.', zh: '代理或代码工具计费和官方价不同时可切换。' },
  'pricing.inputRate': { en: 'Input price', zh: '输入价格' },
  'pricing.inputRateHelp': { en: 'Actual input tokens × input rate.', zh: '实际输入 Token × 输入价。' },
  'pricing.outputRate': { en: 'Output price', zh: '输出价格' },
  'pricing.outputRateHelp': { en: 'Expected output tokens × output rate.', zh: '预估输出 Token × 输出价。' },
  'pricing.cacheRate': { en: 'Cache price', zh: '缓存价格' },
  'pricing.cacheRateHelp': { en: 'Cache hit/write use profile rates when available.', zh: '有缓存命中/写入价时单独计算。' },

  // ── Action Button ─────────────────────────────────────────────────
  'action.calculating': { en: 'Calculating...', zh: '计算中...' },
  'action.estimate': { en: 'Estimate cost', zh: '估算费用' },

  // ── Best Match Card ───────────────────────────────────────────────
  'bestMatch.label': { en: 'Best Match', zh: '最佳匹配' },

  // ── Table Actions ─────────────────────────────────────────────────
  'action.copyMarkdown': { en: 'Copy Markdown', zh: '复制 Markdown' },
  'action.exportCsv': { en: 'Export CSV', zh: '导出 CSV' },
  'action.markdownCopied': { en: 'Markdown table copied', zh: 'Markdown 表格已复制' },

  // ── Results Panel ─────────────────────────────────────────────────
  'results.eyebrow': { en: 'Results', zh: '结果' },
  'results.title': { en: 'Multi-Model Comparison', zh: '多模型对比' },
  'results.calculating': { en: 'Calculating', zh: '计算中' },
  'results.retryFailed': { en: 'Retry failed models', zh: '重试失败的模型' },
  'results.bestValue': { en: 'Best Value', zh: '最佳性价比' },
  'results.noResults': { en: 'No results yet', zh: '暂无结果' },
  'results.viewFull': { en: 'View full comparison', zh: '查看完整对比' },
  'results.fullComparison': { en: 'Full Comparison', zh: '完整对比' },
  'results.collapseDrawer': { en: 'Collapse drawer', zh: '收起抽屉' },
  'results.noResultsDrawer': { en: 'No results', zh: '无结果' },
  'results.summary.totalModels': { en: 'Total Models', zh: '模型总数' },
  'results.summary.avgCost': { en: 'Avg Cost', zh: '平均费用' },
  'results.summary.cheapest': { en: 'Cheapest', zh: '最低' },
  'results.notes': { en: 'Notes', zh: '备注' },
  'results.notesText': { en: 'Estimates based on current model pricing. Actual API costs may vary.', zh: '估算基于当前模型定价，实际 API 费用可能有所不同。' },
  'col.provider': { en: 'Provider', zh: '供应商' },
  'col.details': { en: 'Details', zh: '详情' },

  // ── Result Table Columns ──────────────────────────────────────────
  'col.model': { en: 'Model', zh: '模型' },
  'col.in': { en: 'In', zh: '入' },
  'col.out': { en: 'Out', zh: '出' },
  'col.cost': { en: 'Cost', zh: '费用' },
  'col.mode': { en: 'Mode', zh: '模式' },
  'col.textTokens': { en: 'Text Tokens', zh: '文本 Token' },
  'col.imageTokens': { en: 'Image Tokens', zh: '图片 Token' },
  'col.input': { en: 'Input', zh: '输入' },
  'col.estOutput': { en: 'Est. Output', zh: '预估输出' },
  'col.context': { en: 'Context', zh: '上下文' },
  'col.accuracy': { en: 'Accuracy', zh: '精度' },
  'col.method': { en: 'Method', zh: '方法' },

  // ── Expand Detail Labels ──────────────────────────────────────────
  'detail.imageTokens': { en: 'Image tokens:', zh: '图片 Token：' },
  'detail.accuracy': { en: 'Accuracy:', zh: '精度：' },
  'detail.method': { en: 'Method:', zh: '方法：' },
  'detail.notes': { en: 'Notes:', zh: '备注：' },
  'detail.costBreakdown': { en: 'Cost breakdown:', zh: '费用明细：' },
  'detail.imageDebug': { en: 'Image debug:', zh: '图片调试：' },
  'detail.license': { en: 'License:', zh: '许可证：' },

  // ── History ───────────────────────────────────────────────────────
  'history.eyebrow': { en: 'History', zh: '历史记录' },
  'history.title': { en: 'Recent Estimates', zh: '最近估算' },
  'history.viewAll': { en: 'View all', zh: '查看全部' },
  'history.clear': { en: 'Clear History', zh: '清除历史' },
  'history.empty': { en: 'No estimates yet', zh: '暂无估算记录' },
  'history.allEstimates': { en: 'All Estimates', zh: '所有估算' },
  'history.models': { en: 'models', zh: '个模型' },
  'history.images': { en: 'images', zh: '张图片' },

  // ── Disclaimer ────────────────────────────────────────────────────
  'disclaimer': {
    en: 'Token and cost estimates are approximate. Closed-source models, multimodal inputs, tool calls, PDFs, caching, and system optimizations may cause actual API usage to differ. Verify with provider documentation before commercial use.',
    zh: 'Token 和费用估算均为近似值。闭源模型、多模态输入、工具调用、PDF、缓存和系统优化可能导致实际 API 使用量有所不同。商业使用前请参考供应商文档。',
  },

  // ── Text Input Panel ──────────────────────────────────────────────
  'text.eyebrow': { en: 'Text', zh: '文本' },
  'text.title': { en: 'Text Input', zh: '文本输入' },
  'text.plainText': { en: 'Plain Text', zh: '纯文本' },
  'text.multiTurn': { en: 'Multi-turn', zh: '多轮对话' },
  'text.chars': { en: 'chars', zh: '字符' },
  'text.cjk': { en: 'CJK', zh: '中日韩' },
  'text.words': { en: 'words', zh: '词' },
  'text.placeholder': { en: 'Paste prompt, article, code, or multi-turn conversation...', zh: '粘贴提示词、文章、代码或多轮对话...' },
  'text.systemPlaceholder': { en: 'System instruction (optional)...', zh: '系统指令（可选）...' },
  'text.messagePlaceholder': { en: 'Enter message content...', zh: '输入消息内容...' },
  'text.removeMessage': { en: 'Remove message', zh: '删除消息' },
  'text.addMessage': { en: '+ Add Message', zh: '+ 添加消息' },
  'text.longTextWarning': { en: 'Long text may be slow', zh: '长文本可能较慢' },
  'text.role.system': { en: 'System', zh: '系统' },
  'text.role.user': { en: 'User', zh: '用户' },
  'text.role.assistant': { en: 'Assistant', zh: '助手' },

  // ── Input Area Tabs ───────────────────────────────────────────────
  'tab.text': { en: 'Text', zh: '文本' },
  'tab.image': { en: 'Image', zh: '图片' },
  'tab.pdf': { en: 'PDF', zh: 'PDF' },
  'tab.tools': { en: 'Tools', zh: '工具' },

  // ── Image Tab ─────────────────────────────────────────────────────
  'image.dropzone': { en: 'Drop images here or click to upload', zh: '拖拽图片到此处或点击上传' },
  'image.empty': { en: 'Upload JPG, PNG, WEBP, or GIF. The system reads dimensions and base64 for official counting mode.', zh: '上传 JPG、PNG、WEBP 或 GIF。系统会读取尺寸和 base64 用于官方计数模式。' },
  'image.upload': { en: 'Upload images', zh: '上传图片' },
  'image.remove': { en: 'Remove image', zh: '删除图片' },

  // ── PDF Tab ───────────────────────────────────────────────────────
  'pdf.dropzone': { en: 'Drop PDFs here or click to upload', zh: '拖拽 PDF 到此处或点击上传' },
  'pdf.empty': { en: 'Upload PDF documents. The system extracts text and merges it into token counting. Claude models support official PDF counting.', zh: '上传 PDF 文档。系统会提取文本并合并到 Token 计数中。Claude 模型支持官方 PDF 计数。' },
  'pdf.extracting': { en: 'Extracting PDF content...', zh: '正在提取 PDF 内容...' },
  'pdf.upload': { en: 'Upload PDF', zh: '上传 PDF' },
  'pdf.remove': { en: 'Remove document', zh: '删除文档' },
  'pdf.title': { en: 'PDF Documents', zh: 'PDF 文档' },
  'pdf.eyebrow': { en: 'Document', zh: '文档' },

  // ── Tools Tab ─────────────────────────────────────────────────────
  'tools.eyebrow': { en: 'Tools', zh: '工具' },
  'tools.title': { en: 'Tool Definitions', zh: '工具定义' },
  'tools.add': { en: 'Add tool', zh: '添加工具' },
  'tools.empty': { en: 'Define Function-Call tools (JSON Schema format). The system estimates token overhead for tool definitions.', zh: '定义函数调用工具（JSON Schema 格式）。系统会估算工具定义的 Token 开销。' },
  'tools.namePlaceholder': { en: 'Tool name (e.g. get_weather)', zh: '工具名称（如 get_weather）' },
  'tools.descPlaceholder': { en: 'Tool description', zh: '工具描述' },
  'tools.paramsPlaceholder': { en: 'Parameter JSON Schema', zh: '参数 JSON Schema' },
  'tools.noDescription': { en: 'No description', zh: '无描述' },
  'tools.edit': { en: 'Edit', zh: '编辑' },
  'tools.delete': { en: 'Delete', zh: '删除' },
  'tools.update': { en: 'Update', zh: '更新' },
  'tools.cancel': { en: 'Cancel', zh: '取消' },

  // ── Model Selector ────────────────────────────────────────────────
  'models.search': { en: 'Search models...', zh: '搜索模型...' },
  'models.selectAll': { en: 'Select all', zh: '全选' },
  'models.clear': { en: 'Clear', zh: '清除' },
  'models.resetOrder': { en: 'Reset model order', zh: '重置模型排序' },
  'models.dragHandle': { en: 'Drag to reorder model', zh: '拖动排序模型' },
  'models.imageOnlyMode': { en: 'Image input is active. Only vision-capable models can be selected.', zh: '已上传图片，仅可选择支持视觉输入的模型。' },
  'models.imageUnsupported': { en: 'Disabled: this model does not support image input.', zh: '已禁用：该模型不支持图片输入。' },
  'models.imageUnsupportedRemoved': { en: 'Image input detected; non-vision models were removed from selection.', zh: '检测到图片输入，已移除不支持视觉的模型。' },
  'models.noImageModelsSelected': { en: 'Please select at least one model that supports image input.', zh: '请选择至少一个支持图片输入的模型。' },

  // ── License Notice ────────────────────────────────────────────────
  'license.eyebrow': { en: 'Compliance', zh: '合规性' },
  'license.title': { en: 'Licenses & Counting Methods', zh: '许可证与计数方式' },
  'license.description': {
    en: 'This tool does not label third-party tokenizers of closed-source models as official. Official APIs, open-source tokenizers, and image rule estimation clearly show accuracy and method in results.',
    zh: '本工具不会将闭源模型的第三方分词器标记为官方。官方 API、开源分词器和图片规则估算在结果中会清楚显示精度和方法。',
  },
  'license.noticeRequired': { en: 'Notice required', zh: '需要声明' },
  'license.noNotice': { en: 'No local notice required', zh: '无需本地声明' },
  'license.view': { en: 'View', zh: '查看' },

  // ── Theme Switcher ────────────────────────────────────────────────
  'theme.light': { en: 'Light', zh: '浅色' },
  'theme.dark': { en: 'Dark', zh: '深色' },
  'theme.system': { en: 'System', zh: '跟随系统' },

  // ── Locale Switcher ───────────────────────────────────────────────
  'locale.en': { en: 'EN', zh: 'EN' },
  'locale.zh': { en: 'ZH', zh: '中文' },

  // ── Warnings (counter store) ──────────────────────────────────────
  'error.calculationFailed': { en: 'Calculation failed', zh: '计算失败' },
  'error.selectModel': { en: 'Please select at least one model', zh: '请至少选择一个模型' },
  'error.enterInput': { en: 'Please enter text, upload images, or PDF documents first', zh: '请先输入文本、上传图片或 PDF 文档' },
  'error.modelsFailed': { en: 'model(s) failed, the rest completed', zh: '个模型失败，其余已完成' },

  // ── Input validation warnings ─────────────────────────────────────
  'warning.textTooLong': {
    en: 'Text exceeds the {limit} character limit (currently {current}), counting may time out',
    zh: '文本超过 {limit} 字符限制（当前 {current}），计数可能超时',
  },
  'warning.enterText': { en: 'Please enter some text before counting', zh: '请在计数前输入一些文本' },
  'warning.enterMessage': { en: 'Please enter at least one message before counting', zh: '请在计数前输入至少一条消息' },

  // ── Image upload errors ───────────────────────────────────────────
  'error.unsupportedImage': { en: 'Unsupported file type "{type}", only JPG, PNG, GIF, WEBP are allowed', zh: '不支持的文件类型"{type}"，仅允许 JPG、PNG、GIF、WEBP' },
  'error.imageTooLarge': { en: 'File "{name}" exceeds the 10MB limit (currently {size}MB)', zh: '文件"{name}"超过 10MB 限制（当前 {size}MB）' },
  'error.maxImages': { en: 'Maximum of {max} images reached, please remove some images first', zh: '已达到 {max} 张图片上限，请先删除一些图片' },
  'error.readImage': { en: 'Failed to read image', zh: '读取图片失败' },

  // ── PDF upload errors ─────────────────────────────────────────────
  'error.unsupportedPdf': { en: 'Unsupported file type "{type}", only PDF files are allowed', zh: '不支持的文件类型"{type}"，仅允许 PDF 文件' },
  'error.pdfExtract': { en: 'PDF extraction failed, the file may be corrupted or encrypted', zh: 'PDF 提取失败，文件可能已损坏或加密' },

  // ── Tool errors ───────────────────────────────────────────────────
  'error.toolNameEmpty': { en: 'Tool name cannot be empty', zh: '工具名称不能为空' },
  'error.invalidJson': { en: 'Invalid JSON format for parameters', zh: '参数的 JSON 格式无效' },

  // ── Currency ─────────────────────────────────────────────────────
  'currency.selector': { en: 'Display Currencies', zh: '显示货币' },
  'currency.selectorHelp': { en: 'Select currencies to show in results', zh: '选择要在结果中显示的货币' },
  'currency.refresh': { en: 'Refresh rates', zh: '刷新汇率' },
  'currency.lastUpdated': { en: 'Rates updated', zh: '汇率更新于' },
  'currency.stale': { en: 'Rates may be outdated', zh: '汇率可能已过期' },
  'currency.USD': { en: 'USD ($)', zh: '美元 ($)' },
  'currency.CNY': { en: 'CNY (¥)', zh: '人民币 (¥)' },
  'currency.EUR': { en: 'EUR (€)', zh: '欧元 (€)' },
  'currency.JPY': { en: 'JPY (¥)', zh: '日元 (¥)' },
  'currency.GBP': { en: 'GBP (£)', zh: '英镑 (£)' },
  'currency.KRW': { en: 'KRW (₩)', zh: '韩元 (₩)' },
  'currency.CREDITS': { en: 'Credits', zh: '积分' },
}
