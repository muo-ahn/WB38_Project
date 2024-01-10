//authCheck.js

module.exports = {
  isOwner: function (req, res) {
    return req.isAuthenticated();
  },

  statusUI: function (req, res) {
    var authStatusUI = "로그인후 사용 가능합니다";
    if (this.isOwner(req, res)) {
      authStatusUI = `${req.session.passport.user.username}님 환영합니다 | <a href="/auth/logout">로그아웃</a>`;
    }
    return authStatusUI;
  },
};
