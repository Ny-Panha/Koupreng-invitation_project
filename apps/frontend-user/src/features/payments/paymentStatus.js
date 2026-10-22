const STATUS_TEXT = {
    CREATED: "Payment order created.",
    PENDING: "Payment order created.",
    PAID_PENDING_REVIEW: "Payment detected. Waiting for admin review.",
    QR_CREATED: "QR created. Waiting for ABA PayWay verification.",
    CHECKOUT_CREATED: "Checkout created. Waiting for PayWay verification.",
    PAID: "Payment verified. Template unlocked.",
    CONFIRMED: "Payment confirmed by the provider. Final entitlement verification is in progress.",
    FAILED: "Payment failed.",
    CANCELLED: "Payment was cancelled or not completed.",
    REJECTED: "Payment was rejected. Please contact support.",
    EXPIRED: "This payment order has expired. Please create a new order.",
};

const KHMER_STATUS_TEXT = {
    CREATED: "បានបង្កើតការបញ្ជាទិញទូទាត់។",
    PENDING: "បានបង្កើតការបញ្ជាទិញទូទាត់។",
    PAID_PENDING_REVIEW: "បានរកឃើញការទូទាត់។ កំពុងរង់ចាំការពិនិត្យ។",
    QR_CREATED: "បានបង្កើត QR។ កំពុងរង់ចាំការផ្ទៀងផ្ទាត់ពី ABA PayWay។",
    CHECKOUT_CREATED: "បានបង្កើតការបញ្ជាទិញ។ កំពុងរង់ចាំការផ្ទៀងផ្ទាត់ពី PayWay។",
    PAID: "បានផ្ទៀងផ្ទាត់ការទូទាត់។ អាចប្រើគំរូបានហើយ។",
    CONFIRMED: "អ្នកផ្ដល់សេវាបានបញ្ជាក់ការទូទាត់។ ប្រព័ន្ធកំពុងពិនិត្យសិទ្ធិប្រើប្រាស់។",
    FAILED: "ការទូទាត់មិនបានជោគជ័យ។",
    CANCELLED: "ការទូទាត់ត្រូវបានបោះបង់ ឬមិនបានបញ្ចប់។",
    REJECTED: "ការទូទាត់ត្រូវបានបដិសេធ។ សូមទាក់ទងក្រុមការងារ។",
    EXPIRED: "ការបញ្ជាទិញទូទាត់នេះផុតកំណត់ហើយ។ សូមបង្កើតការបញ្ជាទិញថ្មី។",
};

export function statusMessage(status, language = "en") {
    return language === "en"
        ? STATUS_TEXT[status] || "Payment status is unavailable."
        : KHMER_STATUS_TEXT[status] || "មិនមានស្ថានភាពការទូទាត់ទេ។";
}

export function isTerminalStatus(status) {
    return ["PAID", "FAILED", "CANCELLED", "EXPIRED", "REJECTED"].includes(status);
}
