exports.Expires = {
  fileMatch: /^(gif|png|jpg|js|css)$/ig,
  // maxAge: 60 * 60 * 24 * 365
  maxAge: 60 * 60
}

exports.Compress = {
  match: /css|html|js/ig
}

exports.Welcome = {
  file: "index.html"
}

exports.Timeout = 20 * 60 * 1000;
exports.Secure = null;