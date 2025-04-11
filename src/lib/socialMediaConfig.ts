/**
 * 社交媒体平台配置
 * 用于控制哪些社交媒体链接显示
 */

export interface SocialMediaPlatformConfig {
  // 是否显示此平台
  show: boolean;
  // 自定义链接URL (可选，如果不提供则使用默认值)
  customUrl?: string;
}

export interface SocialMediaConfig {
  // 全局控制是否显示所有社交链接
  showSocialLinks: boolean;
  // 图标链接
  icons: {
    [key: string]: SocialMediaPlatformConfig;
  };
  // 文字链接
  text: {
    [key: string]: SocialMediaPlatformConfig;
  };
}

/**
 * 社交媒体配置说明:
 * - showSocialLinks: true/false 控制是否显示所有社交链接
 * - icons: 控制图标链接的显示
 * - text: 控制文字链接的显示
 * 
 * 每个平台的配置:
 * - show: true/false 控制是否显示该平台
 * - customUrl: (可选) 自定义链接URL
 */
const socialMediaConfig: SocialMediaConfig = {
  showSocialLinks: true, // 整体控制是否显示社交链接

  // 控制图标链接
  icons: {
    "公众号": { show: true },
    "X": { show: false }, // 设置为false则不显示X平台
    "B站": { show: true },
    "YouTube": { show: true },
    "小红书": { show: true },
    "抖音": { show: false }, // 设置为false则不显示抖音平台
  },

  // 控制文字链接
  text: {
    "知识星球": { show: true },
    "订阅频道": {
      show: true,
      customUrl: "https://mp.weixin.qq.com/mp/homepage?__biz=MzkyMzY1NTM0Mw==&hid=7&sn=32ac1cb76efc18c9c1851019ed294d64&scene=18#wechat_redirect"
    },
    "AI资源库": { show: true },
    "AI账号升级": { show: true },
    "Cursor云开发": {
      show: true,
      customUrl: "https://cloud.sealos.run/?uid=YSgbXmiema"
    }
  }
};

export default socialMediaConfig;
