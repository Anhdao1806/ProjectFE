function logout() {
    // Xóa trạng thái đăng nhập
    localStorage.removeItem('loggedInUser');
    // Chuyển hướng về trang chủ
    location.href = '../../pages/auth/login.html';
}