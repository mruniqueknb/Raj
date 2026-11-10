package com.rajpipes.billing.service;

public final class PhoneUtil {

    private PhoneUtil() {
    }

    public static String normalizeForWhatsApp(String rawPhone) {
        if (rawPhone == null) {
            return "";
        }
        String digits = rawPhone.replaceAll("\\D", "");
        if (digits.isEmpty()) {
            return "";
        }
        if (digits.length() == 10) {
            return "91" + digits;
        }
        if (digits.startsWith("0") && digits.length() == 11) {
            return "91" + digits.substring(1);
        }
        return digits;
    }
}
