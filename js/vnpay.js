// VNPay Payment Configuration for Nội thất Mộc Nhiên
// Môi trường: Sandbox (Test)

const VNPAY_CONFIG = {
    // Thông tin từ VNPay Sandbox - Account: clone1khangzzz@gmail.com (Cập nhật 27/01/2026)
    tmnCode: 'Y7CBEPJ0',
    hashSecret: 'B7XA8SZ917ZJ4FN667VURCMVR1GVJ0PV',
    vnpUrl: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',

    // Cấu hình return URL
    // Test mode: localhost
    returnUrl: 'http://localhost:5500/vnpay_return.html',

    // Thông tin cố định
    version: '2.1.0',
    command: 'pay',
    currCode: 'VND',
    locale: 'vn',
    orderType: 'other'
};

/**
 * Tạo URL thanh toán VNPay
 * @param {Object} orderInfo - Thông tin đơn hàng
 * @returns {string} URL thanh toán VNPay
 */
function createVNPayPaymentUrl(orderInfo) {
    const {
        orderId,
        amount,
        orderDesc,
        bankCode = '',
        ipAddr = '127.0.0.1'
    } = orderInfo;

    // Tạo timestamp
    const createDate = moment().format('YYYYMMDDHHmmss');

    // Tạo các tham số thanh toán
    let vnp_Params = {
        vnp_Version: VNPAY_CONFIG.version,
        vnp_Command: VNPAY_CONFIG.command,
        vnp_TmnCode: VNPAY_CONFIG.tmnCode,
        vnp_Locale: VNPAY_CONFIG.locale,
        vnp_CurrCode: VNPAY_CONFIG.currCode,
        vnp_TxnRef: orderId,
        vnp_OrderInfo: orderDesc,
        vnp_OrderType: VNPAY_CONFIG.orderType,
        vnp_Amount: amount * 100, // VNPay yêu cầu nhân 100
        vnp_ReturnUrl: VNPAY_CONFIG.returnUrl,
        vnp_IpAddr: ipAddr,
        vnp_CreateDate: createDate
    };

    // Thêm bankCode nếu có
    if (bankCode && bankCode !== '') {
        vnp_Params['vnp_BankCode'] = bankCode;
    }

    // Sắp xếp params theo alphabet
    vnp_Params = sortObject(vnp_Params);

    // Tạo query string
    const signData = new URLSearchParams(vnp_Params).toString();

    // Tạo secure hash (VNPay yêu cầu HmacSHA512)
    const hmac = CryptoJS.HmacSHA512(signData, VNPAY_CONFIG.hashSecret);
    const secureHash = hmac.toString(CryptoJS.enc.Hex);

    // Thêm secure hash vào params
    vnp_Params['vnp_SecureHash'] = secureHash;

    // Tạo URL hoàn chỉnh
    const querystring = new URLSearchParams(vnp_Params).toString();
    const paymentUrl = VNPAY_CONFIG.vnpUrl + '?' + querystring;

    return paymentUrl;
}

/**
 * Sắp xếp object theo key (alphabet)
 * @param {Object} obj 
 * @returns {Object} Object đã được sắp xếp
 */
function sortObject(obj) {
    const sorted = {};
    const keys = Object.keys(obj).sort();

    keys.forEach(key => {
        sorted[key] = obj[key];
    });

    return sorted;
}

/**
 * Verify VNPay Return URL
 * @param {Object} vnpParams - Params từ VNPay return
 * @returns {boolean} True nếu hợp lệ
 */
function verifyVNPayReturn(vnpParams) {
    const secureHash = vnpParams['vnp_SecureHash'];

    // Xóa hash và hash type khỏi params
    delete vnpParams['vnp_SecureHash'];
    delete vnpParams['vnp_SecureHashType'];

    // Sắp xếp params
    const sortedParams = sortObject(vnpParams);

    // Tạo sign data
    const signData = new URLSearchParams(sortedParams).toString();

    // Tạo hash để so sánh (VNPay yêu cầu HmacSHA512)
    const hmac = CryptoJS.HmacSHA512(signData, VNPAY_CONFIG.hashSecret);
    const checkSum = hmac.toString(CryptoJS.enc.Hex);

    return secureHash === checkSum;
}

/**
 * Lấy IP address của client (demo)
 * @returns {string} IP address
 */
function getClientIp() {
    // Trong môi trường thực tế, IP sẽ được lấy từ server
    return '127.0.0.1';
}

/**
 * Format số tiền VND
 * @param {number} amount 
 * @returns {string} Số tiền đã format
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

// Export cho sử dụng global
window.VNPAY_CONFIG = VNPAY_CONFIG;
window.createVNPayPaymentUrl = createVNPayPaymentUrl;
window.verifyVNPayReturn = verifyVNPayReturn;
window.getClientIp = getClientIp;
window.formatCurrency = formatCurrency;

console.log('✅ VNPay Payment Module loaded successfully');
console.log('🏪 Merchant: Nội thất Mộc Nhiên');
console.log('🔑 TMN Code:', VNPAY_CONFIG.tmnCode);
