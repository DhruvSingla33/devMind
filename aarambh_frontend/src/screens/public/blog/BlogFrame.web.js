import React from 'react';

// Web build of the blog renderer. Each blog is a full standalone HTML document
// served from /public/blogs/<slug>.html, so we drop it into an <iframe> — that
// keeps its own <style>/<script> (audio, canvas, animations) fully isolated
// from the app's styles. The native build (WebView) lives in BlogFrame.js.
const BlogFrame = ({ slug, title }) => (
  <iframe
    src={`/blogs/${slug}.html`}
    title={title}
    style={{ border: 0, width: '100%', height: '100%', display: 'block', background: '#fff' }}
    loading="lazy"
  />
);

export default BlogFrame;
