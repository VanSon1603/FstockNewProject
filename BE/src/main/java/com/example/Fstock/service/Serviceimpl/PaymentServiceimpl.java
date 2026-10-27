    package com.example.Fstock.service.Serviceimpl;
    import com.example.Fstock.config.VnpayConfig;
    import com.example.Fstock.service.Service.PaymentService;
    import jakarta.servlet.http.HttpServletRequest;
    import lombok.RequiredArgsConstructor;
    import org.springframework.beans.factory.annotation.Autowired;
    import org.springframework.stereotype.Service;
    import javax.crypto.Mac;
    import javax.crypto.spec.SecretKeySpec;
    import java.io.UnsupportedEncodingException;
    import java.net.URLEncoder;
    import java.nio.charset.StandardCharsets;
    import java.util.*;
    import java.util.stream.Collectors;

    @Service
    @RequiredArgsConstructor
    public class PaymentServiceimpl implements PaymentService {

        private final VnpayConfig vnpayConfig;

        @Override
        public String createOrderVNPAY(HttpServletRequest request) throws  UnsupportedEncodingException {
            long amount = Integer.parseInt(request.getParameter("amount")) * 100L;
            String bankCode = request.getParameter("bankCode");
            Map<String, String> vnpParamsMap = vnpayConfig.getVNPayConfig();
            String orderId = request.getParameter("orderId");
            vnpParamsMap.put("vnp_TxnRef", orderId);
            vnpParamsMap.put("vnp_OrderInfo", "Thanh toan don hang:" + orderId);
            vnpParamsMap.put("vnp_Amount", String.valueOf(amount));
            if (bankCode != null && !bankCode.isEmpty()) {
                vnpParamsMap.put("vnp_BankCode", bankCode);
            }
            vnpParamsMap.put("vnp_IpAddr", getIpAddress(request));
            String queryUrl = getPaymentURL(vnpParamsMap, true);
            String hashData = getPaymentURL(vnpParamsMap, false);
            String vnpSecureHash = hmacSHA512(vnpayConfig.getVnp_SecretKey(), hashData);
            queryUrl += "&vnp_SecureHash=" + vnpSecureHash;
            String paymentUrl = vnpayConfig.getVnp_PayUrl() + "?" + queryUrl;
            return paymentUrl;
        }

        public static String getIpAddress(HttpServletRequest request) {
            String ipAdress;
            try {
                    ipAdress = request.getHeader("X-FORWARDED-FOR");
                if (ipAdress == null) {
                    ipAdress = request.getRemoteAddr();
                }
            } catch (Exception e) {
                ipAdress = "Invalid IP:" + e.getMessage();
            }
            return ipAdress;
        }

        public static String hmacSHA512(final String key, final String data) {
            try {

                if (key == null || data == null) {
                    throw new NullPointerException();
                }
                final Mac hmac512 = Mac.getInstance("HmacSHA512");
                byte[] hmacKeyBytes = key.getBytes();
                final SecretKeySpec secretKey = new SecretKeySpec(hmacKeyBytes, "HmacSHA512");
                hmac512.init(secretKey);
                byte[] dataBytes = data.getBytes(StandardCharsets.UTF_8);
                byte[] result = hmac512.doFinal(dataBytes);
                StringBuilder sb = new StringBuilder(2 * result.length);
                for (byte b : result) {
                    sb.append(String.format("%02x", b & 0xff));
                }
                return sb.toString();

            } catch (Exception ex) {
                return "";
            }
        }
        public static String getPaymentURL(Map<String, String> paramsMap, boolean encodeKey) {
            return paramsMap.entrySet().stream()
                    .filter(entry -> entry.getValue() != null && !entry.getValue().isEmpty())
                    .sorted(Map.Entry.comparingByKey())
                    .map(entry ->
                            (encodeKey ? URLEncoder.encode(entry.getKey(),
                                    StandardCharsets.US_ASCII)
                                    : entry.getKey()) + "=" +
                                    URLEncoder.encode(entry.getValue()
                                            , StandardCharsets.US_ASCII))
                    .collect(Collectors.joining("&"));
        }

    }
