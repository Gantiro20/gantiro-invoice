export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fa-IR').format(amount) + ' تومان';
};

export const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fa-IR').format(num);
};

export const toJalaliDate = (date: Date) => {
    return new Intl.DateTimeFormat('fa-IR', {
        calendar: 'persian',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }).format(date);
};

export const toPersianDigits = (str: string) => {
    return str.replace(/[0-9]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d)]);
};

export const getJalaliNow = () => {
    const d = new Date();
    const formatted = new Intl.DateTimeFormat('fa-IR-u-nu-latn', { calendar: 'persian', year: 'numeric', month: 'numeric', day: 'numeric' }).format(d);
    // formatted might be "1403/10/24" or similar depending on browser, let's normalize
    const parts = formatted.match(/(\d+)/g);
    if (!parts || parts.length < 3) return { y: 1403, m: 1, d: 1 };
    return { y: parseInt(parts[0]), m: parseInt(parts[1]), d: parseInt(parts[2]) };
};

export const jalaliToGregorian = (jy: number, jm: number, jd: number): Date => {
    const g_days_in_month = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    const j_days_in_month = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];
    
    jy += 1595;
    let days = -355668 + (365 * jy) + Math.floor(jy / 33) * 8 + Math.floor(((jy % 33) + 3) / 4) + jd;
    for (let i = 0; i < jm - 1; ++i) days += j_days_in_month[i];
    
    let gy = 400 * Math.floor(days / 146097);
    days %= 146097;
    if (days > 36524) {
        days--;
        gy += 100 * Math.floor(days / 36524);
        days %= 36524;
        if (days >= 365) days++;
    }
    gy += 4 * Math.floor(days / 1461);
    days %= 1461;
    if (days > 365) {
        gy += Math.floor((days - 1) / 365);
        days = (days - 1) % 365;
    }
    let gd = days + 1;
    let gm = 0;
    for (let i = 0; i < 12; i++) {
        let delta = g_days_in_month[i];
        if (i === 1 && ((gy % 4 === 0 && gy % 100 !== 0) || (gy % 400 === 0))) delta++;
        if (gd <= delta) {
            gm = i + 1;
            break;
        }
        gd -= delta;
    }
    return new Date(gy, gm - 1, gd);
};

export const generateInvoiceId = (sequence: number) => {
    const date = new Date();
    // Getting Jalali Year/Month simply
    const jalaliParts = new Intl.DateTimeFormat('fa-IR-u-nu-latn', { calendar: 'persian', year: 'numeric', month: '2-digit' }).formatToParts(date);
    const year = jalaliParts.find(p => p.type === 'year')?.value;
    const month = jalaliParts.find(p => p.type === 'month')?.value;
    
    // Pad sequence to 4 digits
    const seqStr = sequence.toString().padStart(4, '0');
    
    return `INV-${year}-${month}-${seqStr}`;
};

export const generateId = (prefix: string) => {
    return `${prefix}-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
};