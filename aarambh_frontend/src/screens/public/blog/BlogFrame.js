import React from 'react';
import { WebView } from 'react-native-webview';

// Native build of the blog renderer. The HTML files are served from the web
// origin (Expo /public), so native loads them over the network from the
// production site. The web build (iframe) lives in BlogFrame.web.js.
const BLOG_BASE_URL = 'https://aarambhstudy.in';

const BlogFrame = ({ slug }) => (
  <WebView
    source={{ uri: `${BLOG_BASE_URL}/blogs/${slug}.html` }}
    style={{ flex: 1, backgroundColor: '#fff' }}
    originWhitelist={['*']}
    javaScriptEnabled
    domStorageEnabled
    mediaPlaybackRequiresUserAction
  />
);

export default BlogFrame;
