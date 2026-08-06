/**
 * TruckLink – سياسة الخصوصية / Privacy Policy
 *
 * Arabic text is the authoritative version per Saudi law.
 * Compliant with:
 *   • نظام حماية البيانات الشخصية (PDPL) – Royal Decree M/19 dated 1443/02/09
 *   • لائحة نظام حماية البيانات الشخصية الصادرة عن هيئة حماية البيانات الشخصية (NDMO)
 *   • Saudi Digital Government Authority (SDGA) guidelines
 *   • متطلبات هيئة الاتصالات والفضاء والتقنية (CST)
 */

import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { COLORS } from '../utils/constants';

const PRIVACY = {
  ar: {
    title: 'سياسة الخصوصية',
    lastUpdated: 'آخر تحديث: 1 أغسطس 2026',
    controllerBadge: '🔒 مراقب البيانات: TruckLink للتقنية ش.م.م — الرياض، المملكة العربية السعودية',
    pdplBadge: 'متوافق مع نظام حماية البيانات الشخصية السعودي (PDPL)',
    sections: [
      {
        title: '1. التزامنا بالخصوصية',
        body: 'تلتزم TruckLink بحماية بياناتك الشخصية وفق أحكام نظام حماية البيانات الشخصية السعودي (PDPL) الصادر بالمرسوم الملكي م/19 لعام 1443هـ، ولائحته التنفيذية الصادرة عن هيئة حماية البيانات الشخصية (NDMO). هذه السياسة تشرح ما نجمعه وكيف نستخدمه وحقوقك كاملةً.',
      },
      {
        title: '2. البيانات التي نجمعها',
        body: 'أ) بيانات التسجيل (إلزامية):\n• رقم الجوال (لإرسال رمز التحقق OTP)\n• الاسم الكامل\n• نوع الحساب (صاحب شحنة / سائق)\n\nب) بيانات السائقين الإضافية (إلزامية لتقديم الخدمة):\n• رقم رخصة القيادة\n• لوحة الشاحنة ونوعها وحمولتها\n• الموقع الجغرافي التقريبي (مستوى المدينة فقط)\n\nج) بيانات المعاملات:\n• تفاصيل الشحنات المنشورة\n• العروض والعقود المُبرمة\n• سجل الدفع والعمولات\n\nد) بيانات الاستخدام (تلقائياً):\n• نوع الجهاز ونظام التشغيل\n• سجلات أخطاء التطبيق (لأغراض تقنية فقط)\n• وقت وتاريخ الجلسات',
      },
      {
        title: '3. الغرض من معالجة البيانات والأساس القانوني',
        body: 'وفق المادة (5) من PDPL نعالج بياناتك على الأسس التالية:\n\n• تنفيذ العقد: إنشاء الحساب، تنفيذ عمليات الشحن، معالجة المدفوعات.\n• الالتزام القانوني: الامتثال لمتطلبات هيئة الزكاة والضريبة والجمارك، وساما، ووزارة النقل.\n• المصلحة المشروعة: تحسين الخدمة، منع الاحتيال، الأمن الإلكتروني.\n• الموافقة (حيث مطلوبة): إرسال الإشعارات الترويجية — يمكنك سحب موافقتك في أي وقت.',
      },
      {
        title: '4. موقعك الجغرافي',
        body: '• نستخدم الموقع التقريبي (مستوى المدينة) لعرض الشاحنات المتاحة على الخريطة.\n• لا يُشارك موقعك الدقيق مع أصحاب الشحنات إطلاقاً إلا بعد إبرام الاتفاق رسمياً.\n• يمكنك إيقاف مشاركة موقعك من إعدادات التطبيق أو جهازك في أي وقت.\n• نطبق إزاحة عشوائية على الإحداثيات (±5 كم) قبل عرضها للطرف الآخر.',
      },
      {
        title: '5. مشاركة البيانات مع أطراف ثالثة',
        body: 'لا نبيع بياناتك أو نؤجّرها. نشاركها فقط في الحالات التالية:\n\n• طرف الصفقة الآخر: يرى صاحب الشحنة اسمك ومنطقتك بعد قبول العرض. يرى السائق معلومات التواصل الخاصة بصاحب الشحنة بعد الاتفاق.\n• مزودو الخدمات التقنية: خوادم Railway (الاستضافة، الولايات المتحدة). نطبق اتفاقيات معالجة البيانات (DPA) مع هؤلاء المزودين.\n• الجهات الحكومية السعودية: وفق متطلبات القانون أو أوامر المحاكم المختصة.\n\nأي نقل للبيانات خارج المملكة يخضع لضمانات مناسبة وفق المادة (29) من PDPL.',
      },
      {
        title: '6. مدة الاحتفاظ بالبيانات',
        body: 'بيانات الحساب: طالما كان الحساب نشطاً + 5 سنوات بعد الإغلاق (للامتثال الضريبي).\nبيانات المعاملات: 10 سنوات (متطلبات هيئة الزكاة والضريبة والجمارك).\nسجلات الاستخدام التقنية: 90 يوماً.\nبيانات الموقع الجغرافي: تُحذف فور إنهاء الشحنة أو إيقاف توفر السائق.\n\nبعد انتهاء فترة الاحتفاظ تُحذف البيانات بصورة آمنة لا رجعة فيها.',
      },
      {
        title: '7. حقوقك وفق نظام PDPL',
        body: 'يكفل لك نظام حماية البيانات الشخصية السعودي الحقوق التالية:\n\n✦ الوصول: طلب نسخة من بياناتك الشخصية.\n✦ التصحيح: تصحيح البيانات غير الدقيقة.\n✦ الحذف: طلب حذف بياناتك (مع مراعاة متطلبات الاحتفاظ القانونية).\n✦ الاعتراض: الاعتراض على معالجة بياناتك لأغراض التسويق.\n✦ القيد: طلب تقييد معالجة بياناتك في ظروف معينة.\n✦ النقل: الحصول على بياناتك بتنسيق قابل للقراءة الآلية.\n\nلممارسة أي من هذه الحقوق، تواصل مع مسؤول حماية البيانات على: privacy@trucklink.sa\nنرد خلال 15 يوماً عملاً وفق المادة (17) من PDPL.',
      },
      {
        title: '8. أمان البيانات',
        body: 'نطبق الإجراءات الأمنية التالية:\n• تشفير البيانات أثناء النقل (TLS 1.3).\n• تشفير كلمات المرور وأرقام الجوال بخوارزمية bcrypt.\n• جدران نارية وفحص دوري لأمن التطبيق.\n• وصول محدود للبيانات على أساس مبدأ الحاجة إلى المعرفة.\n• نسخ احتياطية مشفرة يومية.\n\nفي حال وقوع اختراق يؤثر على بياناتك، سنخطرك والجهة المختصة خلال 72 ساعة وفق أحكام PDPL.',
      },
      {
        title: '9. الأطفال',
        body: 'لا نجمع بيانات الأشخاص دون 18 سنة عمداً. إذا علمنا بأن قاصراً قدّم بياناته، نحذف حسابه فوراً. إذا كنت وليّ أمر وتعتقد أن طفلك سجّل في التطبيق، تواصل معنا على: privacy@trucklink.sa',
      },
      {
        title: '10. ملفات تعريف الارتباط (Cookies)',
        body: 'في النسخة الإلكترونية (الويب) نستخدم ملفات الارتباط الضرورية فقط لأغراض تشغيلية (الجلسة، الأمان). لا نستخدم ملفات ارتباط تتبع أو تسويقية. يمكنك ضبط إعدادات المتصفح لحظر ملفات الارتباط مع ملاحظة أن ذلك قد يؤثر على بعض وظائف التطبيق.',
      },
      {
        title: '11. التحديثات على السياسة',
        body: 'نُخطرك بأي تغييرات جوهرية على هذه السياسة عبر إشعار داخل التطبيق قبل 14 يوماً. نحتفظ بسجل بالنسخ السابقة ونوفّرها على طلب. تاريخ السريان الفعلي موضح في أعلى الصفحة.',
      },
      {
        title: '12. التواصل مع مسؤول حماية البيانات',
        body: 'مسؤول حماية البيانات (DPO):\nالبريد الإلكتروني: privacy@trucklink.sa\nالهاتف: 920000000\nالعنوان: الرياض، المملكة العربية السعودية\n\nللشكاوى غير المحسومة، يحق لك التواصل مع الهيئة الوطنية لإدارة البيانات ومنظومة الذكاء الاصطناعي (NDMO):\nwww.ndmo.gov.sa',
      },
    ],
  },
  en: {
    title: 'Privacy Policy',
    lastUpdated: 'Last updated: 1 August 2026',
    controllerBadge: '🔒 Data Controller: TruckLink Technology LLC — Riyadh, Saudi Arabia',
    pdplBadge: 'Compliant with Saudi Personal Data Protection Law (PDPL)',
    sections: [
      {
        title: '1. Our Commitment to Privacy',
        body: "TruckLink is committed to protecting your personal data in accordance with the Saudi Personal Data Protection Law (PDPL) issued by Royal Decree M/19 of 1443H, and its implementing regulations issued by the National Data Management Office (NDMO). This Policy explains what we collect, how we use it, and your full rights.",
      },
      {
        title: '2. Data We Collect',
        body: 'a) Registration Data (mandatory):\n• Mobile number (for OTP verification)\n• Full name\n• Account type (shipper / driver)\n\nb) Additional Driver Data (required to provide the service):\n• Driving license number\n• Truck plate, type, and capacity\n• Approximate geographic location (city level only)\n\nc) Transaction Data:\n• Posted shipment details\n• Bids and agreed contracts\n• Payment history and commissions\n\nd) Usage Data (automatic):\n• Device type and operating system\n• App error logs (technical purposes only)\n• Session timestamps',
      },
      {
        title: '3. Purpose of Processing and Legal Basis',
        body: 'Per Article 5 of PDPL, we process your data on the following bases:\n\n• Contract Performance: Account creation, executing shipments, processing payments.\n• Legal Obligation: Compliance with ZATCA, SAMA, and Ministry of Transport requirements.\n• Legitimate Interest: Service improvement, fraud prevention, cybersecurity.\n• Consent (where required): Sending promotional notifications — withdrawable at any time.',
      },
      {
        title: '4. Your Geographic Location',
        body: '• We use approximate location (city level) to display available trucks on the map.\n• Your precise location is never shared with shippers until an agreement is formally concluded.\n• You can disable location sharing from app or device settings at any time.\n• We apply a random offset to coordinates (±5 km) before displaying them to the other party.',
      },
      {
        title: '5. Sharing with Third Parties',
        body: "We do not sell or rent your data. We share it only in the following cases:\n\n• Transaction party: The shipper sees your name and region after bid acceptance. The driver sees shipper contact info after agreement.\n• Technical service providers: Railway servers (hosting, USA). We maintain Data Processing Agreements (DPA) with these providers.\n• Saudi government authorities: As required by law or competent court orders.\n\nAny transfer of data outside the Kingdom is subject to appropriate safeguards per Article 29 of PDPL.",
      },
      {
        title: '6. Data Retention',
        body: 'Account data: While the account is active + 5 years after closure (tax compliance).\nTransaction data: 10 years (ZATCA requirements).\nTechnical usage logs: 90 days.\nGeolocation data: Deleted immediately upon shipment completion or driver de-activation.\n\nAfter the retention period, data is securely and irreversibly deleted.',
      },
      {
        title: '7. Your Rights Under PDPL',
        body: 'The Saudi Personal Data Protection Law guarantees you the following rights:\n\n✦ Access: Request a copy of your personal data.\n✦ Correction: Correct inaccurate data.\n✦ Deletion: Request deletion of your data (subject to legal retention requirements).\n✦ Objection: Object to processing your data for marketing purposes.\n✦ Restriction: Request restriction of processing in certain circumstances.\n✦ Portability: Obtain your data in a machine-readable format.\n\nTo exercise any of these rights, contact our Data Protection Officer at: privacy@trucklink.sa\nWe respond within 15 working days per Article 17 of PDPL.',
      },
      {
        title: '8. Data Security',
        body: 'We implement the following security measures:\n• Encryption of data in transit (TLS 1.3).\n• Password and mobile number hashing with bcrypt.\n• Firewalls and periodic application security audits.\n• Limited data access on a need-to-know basis.\n• Daily encrypted backups.\n\nIn the event of a breach affecting your data, we will notify you and the relevant authority within 72 hours per PDPL provisions.',
      },
      {
        title: '9. Children',
        body: "We do not intentionally collect data from persons under 18. If we learn that a minor has submitted their data, we delete their account immediately. If you are a guardian and believe your child has registered, contact us at: privacy@trucklink.sa",
      },
      {
        title: '10. Cookies',
        body: 'In the web version, we use only essential cookies for operational purposes (session, security). We do not use tracking or marketing cookies. You can configure your browser to block cookies, noting this may affect some app functions.',
      },
      {
        title: '11. Policy Updates',
        body: 'We notify you of any material changes to this Policy via an in-app notice at least 14 days before they take effect. We maintain a record of previous versions available on request. The effective date is shown at the top of this page.',
      },
      {
        title: '12. Contact Data Protection Officer',
        body: 'Data Protection Officer (DPO):\nEmail: privacy@trucklink.sa\nPhone: 920000000\nAddress: Riyadh, Saudi Arabia\n\nFor unresolved complaints, you have the right to contact the National Data Management Office (NDMO):\nwww.ndmo.gov.sa',
      },
    ],
  },
};

export default function PrivacyScreen({ navigation }) {
  const { lang } = useLanguage();
  const content = PRIVACY[lang] || PRIVACY.ar;
  const isAr = lang === 'ar';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.back}>{isAr ? '→' : '←'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{content.title}</Text>
      </View>

      <Text style={styles.lastUpdated}>{content.lastUpdated}</Text>

      {/* PDPL compliance badge */}
      <View style={styles.pdplBadge}>
        <Text style={[styles.pdplBadgeText, isAr && styles.rtl]}>{content.controllerBadge}</Text>
        <Text style={[styles.pdplBadgeLabel, isAr && styles.rtl]}>{content.pdplBadge}</Text>
      </View>

      {content.sections.map((sec, i) => (
        <View key={i} style={styles.section}>
          <Text style={[styles.sectionTitle, isAr && styles.rtl]}>{sec.title}</Text>
          <Text style={[styles.sectionBody, isAr && styles.rtl]}>{sec.body}</Text>
        </View>
      ))}

      <View style={styles.footer}>
        <Text style={[styles.footerText, isAr && styles.rtl]}>
          {isAr
            ? 'هذه السياسة تخضع لأحكام نظام حماية البيانات الشخصية السعودي (PDPL) الصادر بالمرسوم الملكي م/19 ولوائحه التنفيذية الصادرة عن الهيئة الوطنية لإدارة البيانات (NDMO).'
            : 'This Policy is governed by the Saudi Personal Data Protection Law (PDPL) issued by Royal Decree M/19 and its implementing regulations issued by the National Data Management Office (NDMO).'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:       { flexGrow: 1, backgroundColor: COLORS.bg, padding: 20, paddingTop: 54 },
  header:          { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  backBtn:         { marginRight: 12 },
  back:            { fontSize: 22, color: COLORS.primary },
  title:           { fontSize: 22, fontWeight: '800', color: COLORS.text },
  lastUpdated:     { fontSize: 12, color: COLORS.subtext, marginBottom: 12 },
  pdplBadge:       { backgroundColor: COLORS.primary, borderRadius: 12, padding: 14, marginBottom: 20 },
  pdplBadgeText:   { fontSize: 13, fontWeight: '700', color: '#fff', marginBottom: 4 },
  pdplBadgeLabel:  { fontSize: 11, color: 'rgba(255,255,255,0.8)' },
  section:         { marginBottom: 20 },
  sectionTitle:    { fontSize: 15, fontWeight: '800', color: COLORS.text, marginBottom: 8 },
  sectionBody:     { fontSize: 13, color: COLORS.subtext, lineHeight: 21 },
  rtl:             { textAlign: 'right', writingDirection: 'rtl' },
  footer:          { backgroundColor: '#E8F4FD', borderRadius: 12, padding: 14,
                     borderWidth: 1.5, borderColor: '#1A3C5E33', marginBottom: 30 },
  footerText:      { fontSize: 12, color: '#1A3C5E', lineHeight: 18 },
});
