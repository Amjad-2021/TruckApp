/**
 * TruckLink – شروط الاستخدام / Terms of Service
 *
 * Arabic text is the authoritative version in compliance with Saudi law.
 * Compliant with:
 *   • نظام حماية البيانات الشخصية (PDPL) – Royal Decree M/19 dated 1443/02/09
 *   • نظام التجارة الإلكترونية السعودي
 *   • متطلبات هيئة الاتصالات والفضاء والتقنية (CST)
 *   • Saudi Digital Government Authority (SDGA) guidelines
 */

import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { COLORS } from '../utils/constants';

const TERMS = {
  ar: {
    title: 'شروط الاستخدام',
    lastUpdated: 'آخر تحديث: 1 أغسطس 2026',
    intro: 'يُرجى قراءة هذه الشروط بعناية قبل استخدام تطبيق TruckLink. باستخدامك للتطبيق، فإنك توافق على الالتزام بهذه الشروط.',
    sections: [
      {
        title: '1. تعريفات',
        body: '"TruckLink" أو "التطبيق": منصة الوساطة الرقمية المرخصة للربط بين أصحاب الشحنات وسائقي الشاحنات داخل المملكة العربية السعودية.\n\n"المستخدم": أي شخص يسجّل في التطبيق سواء بصفته صاحب شحنة أو سائقاً.\n\n"الخدمة": جميع الميزات والوظائف المتاحة عبر التطبيق أو الموقع الإلكتروني.',
      },
      {
        title: '2. أهلية الاستخدام',
        body: 'يجب أن يكون المستخدم:\n• بالغاً من العمر 18 سنة على الأقل.\n• مقيماً في المملكة العربية السعودية أو يمارس نشاطاً تجارياً مرخصاً فيها.\n• حاملاً لترخيص تجاري ساري المفعول (لأصحاب الشحنات والشركات).\n• حاملاً لرخصة قيادة سارية المفعول (للسائقين).\n\nيُحق لنا تعليق أي حساب لا يستوفي هذه الشروط.',
      },
      {
        title: '3. طبيعة الخدمة',
        body: 'TruckLink هي منصة وساطة إلكترونية فقط. لا تمتلك TruckLink أي شاحنات ولا توظّف سائقين. العقد الفعلي للنقل يُبرم مباشرةً بين صاحب الشحنة والسائق. تُقدّم TruckLink الربط التقني وخدمة التفاوض وتتقاضى عمولة منصة بنسبة 3% من قيمة العقد.',
      },
      {
        title: '4. المدفوعات والعمولة',
        body: 'رسوم المنصة: 3% من قيمة الشحنة المتفق عليها.\nتُخصم الرسوم تلقائياً من المبلغ المدفوع للسائق.\nجميع المدفوعات بالريال السعودي (SAR).\nلا تسترد الرسوم بعد تنفيذ الشحنة.\n\nتخضع المدفوعات لأنظمة مؤسسة النقد العربي السعودي (ساما).',
      },
      {
        title: '5. مسؤوليات المستخدمين',
        body: 'صاحب الشحنة مسؤول عن:\n• دقة معلومات البضائع (النوع والوزن والأبعاد والمتطلبات الخاصة).\n• الحصول على تصاريح نقل البضائع الخاضعة لرقابة خاصة.\n• الإبلاغ عن أي بضائع محظورة أو خطرة.\n\nالسائق مسؤول عن:\n• صحة بيانات الرخصة والشاحنة.\n• الالتزام بأنظمة المرور ونظام النقل البري السعودي.\n• سلامة البضاعة خلال النقل.',
      },
      {
        title: '6. البضائع المحظورة',
        body: 'يُحظر نقل ما يلي عبر المنصة:\n• البضائع المخالفة لأحكام الشريعة الإسلامية.\n• الأسلحة والذخائر دون ترخيص رسمي.\n• المواد المخدرة والمؤثرات العقلية.\n• البضائع الخاضعة لعقوبات دولية أو محلية.\n\nمخالفة هذا البند تُعرّض المستخدم للمساءلة القانونية ويُغلق حسابه فوراً.',
      },
      {
        title: '7. تعليق الحساب وإنهاؤه',
        body: 'يحق لـ TruckLink تعليق أي حساب أو إنهاؤه في الحالات التالية:\n• انتهاك هذه الشروط.\n• تقديم معلومات مزيفة.\n• التقييمات السلبية المتكررة.\n• الاشتباه في النشاط الاحتيالي.\n\nيحق للمستخدم طلب مراجعة قرار التعليق خلال 14 يوماً.',
      },
      {
        title: '8. حدود المسؤولية',
        body: 'لا تتحمل TruckLink المسؤولية عن:\n• التأخير في التسليم الناجم عن ظروف خارج سيطرتها (الطقس، الحوادث، القرارات الحكومية).\n• الأضرار التي تلحق بالبضائع أثناء النقل (يتحملها السائق وفق العقد المبرم).\n• الخسائر غير المباشرة أو التبعية.\n\nالحد الأقصى لمسؤولية TruckLink لا يتجاوز قيمة عمولة المنصة المحصّلة عن الصفقة المعنية.',
      },
      {
        title: '9. حل النزاعات',
        body: 'في حال نشوء نزاع:\n1. يُلزم المستخدمون بمحاولة الحل الودي خلال 7 أيام.\n2. تتوسط TruckLink في النزاعات المتعلقة بالمعاملات داخل المنصة.\n3. في حال تعذّر الحل، يُحال النزاع إلى المحاكم السعودية المختصة وفقاً لأنظمة المملكة.\n\nأي نزاع يخضع للقانون السعودي وتختص به محاكم مدينة الرياض.',
      },
      {
        title: '10. التعديلات',
        body: 'تحتفظ TruckLink بحق تعديل هذه الشروط في أي وقت. يُخطَر المستخدمون بالتغييرات الجوهرية عبر إشعار داخل التطبيق قبل 14 يوماً على الأقل من تطبيقها. الاستمرار في استخدام التطبيق بعد سريان التعديلات يُعدّ قبولاً لها.',
      },
      {
        title: '11. التواصل',
        body: 'للاستفسارات المتعلقة بشروط الاستخدام:\nالبريد الإلكتروني: legal@trucklink.sa\nالهاتف: 920000000\nالعنوان: الرياض، المملكة العربية السعودية',
      },
    ],
  },
  en: {
    title: 'Terms of Service',
    lastUpdated: 'Last updated: 1 August 2026',
    intro: 'Please read these Terms carefully before using TruckLink. By using the application, you agree to be bound by these Terms.',
    sections: [
      {
        title: '1. Definitions',
        body: '"TruckLink" or "the App": A licensed digital brokerage platform connecting shippers and truck drivers within Saudi Arabia.\n\n"User": Any person who registers in the App as a shipper or driver.\n\n"Service": All features and functions available through the App or website.',
      },
      {
        title: '2. Eligibility',
        body: 'Users must be:\n• At least 18 years of age.\n• Residing in Saudi Arabia or operating a licensed business therein.\n• Holding a valid commercial registration (for shippers and companies).\n• Holding a valid driving license (for drivers).\n\nWe reserve the right to suspend any account that does not meet these requirements.',
      },
      {
        title: '3. Nature of Service',
        body: "TruckLink is an electronic brokerage platform only. TruckLink does not own any trucks or employ drivers. The actual transport contract is made directly between the shipper and the driver. TruckLink provides the technical connection and negotiation service, and charges a platform commission of 3% of the contract value.",
      },
      {
        title: '4. Payments and Commission',
        body: 'Platform fee: 3% of the agreed shipment value.\nFees are deducted automatically from the amount paid to the driver.\nAll payments are in Saudi Riyals (SAR).\nFees are non-refundable after the shipment is executed.\n\nAll payments are subject to SAMA (Saudi Central Bank) regulations.',
      },
      {
        title: '5. User Responsibilities',
        body: 'Shipper is responsible for:\n• Accuracy of cargo information (type, weight, dimensions, special requirements).\n• Obtaining permits for regulated cargo.\n• Reporting any prohibited or dangerous goods.\n\nDriver is responsible for:\n• Validity of license and vehicle information.\n• Compliance with Saudi traffic regulations and land transport law.\n• Safety of cargo during transit.',
      },
      {
        title: '6. Prohibited Goods',
        body: 'The following are prohibited from being transported through the platform:\n• Goods contrary to the provisions of Islamic Sharia.\n• Weapons and ammunition without official authorization.\n• Narcotic drugs and psychotropic substances.\n• Goods subject to international or local sanctions.\n\nViolation of this clause exposes the user to legal liability and immediate account closure.',
      },
      {
        title: '7. Account Suspension and Termination',
        body: 'TruckLink reserves the right to suspend or terminate any account in the following cases:\n• Violation of these Terms.\n• Providing false information.\n• Repeated negative ratings.\n• Suspected fraudulent activity.\n\nUsers have the right to request a review of a suspension decision within 14 days.',
      },
      {
        title: '8. Limitation of Liability',
        body: 'TruckLink is not responsible for:\n• Delivery delays caused by circumstances beyond its control (weather, accidents, government decisions).\n• Damage to goods during transit (responsibility of the driver per the agreed contract).\n• Indirect or consequential losses.\n\nThe maximum liability of TruckLink shall not exceed the value of the platform commission collected for the transaction in question.',
      },
      {
        title: '9. Dispute Resolution',
        body: 'In the event of a dispute:\n1. Users are required to attempt amicable resolution within 7 days.\n2. TruckLink mediates in disputes related to platform transactions.\n3. If resolution is not possible, the dispute is referred to the competent Saudi courts in accordance with the Kingdom\'s regulations.\n\nAny dispute is subject to Saudi law and the exclusive jurisdiction of Riyadh courts.',
      },
      {
        title: '10. Amendments',
        body: 'TruckLink reserves the right to amend these Terms at any time. Users will be notified of material changes via an in-app notice at least 14 days before they take effect. Continued use of the App after the effective date of amendments constitutes acceptance.',
      },
      {
        title: '11. Contact',
        body: 'For inquiries regarding Terms of Service:\nEmail: legal@trucklink.sa\nPhone: 920000000\nAddress: Riyadh, Saudi Arabia',
      },
    ],
  },
};

export default function TermsScreen({ navigation }) {
  const { lang } = useLanguage();
  const content = TERMS[lang] || TERMS.ar;
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
      <Text style={[styles.intro, isAr && styles.rtl]}>{content.intro}</Text>

      {content.sections.map((sec, i) => (
        <View key={i} style={styles.section}>
          <Text style={[styles.sectionTitle, isAr && styles.rtl]}>{sec.title}</Text>
          <Text style={[styles.sectionBody, isAr && styles.rtl]}>{sec.body}</Text>
        </View>
      ))}

      <View style={styles.footer}>
        <Text style={[styles.footerText, isAr && styles.rtl]}>
          {isAr
            ? 'هذه الشروط تخضع لأحكام نظام التجارة الإلكترونية السعودي ونظام حماية البيانات الشخصية (PDPL) الصادر بالمرسوم الملكي م/19.'
            : 'These Terms are governed by the Saudi E-Commerce Law and the Personal Data Protection Law (PDPL) issued by Royal Decree M/19.'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:    { flexGrow: 1, backgroundColor: COLORS.bg, padding: 20, paddingTop: 54 },
  header:       { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  backBtn:      { marginRight: 12 },
  back:         { fontSize: 22, color: COLORS.primary },
  title:        { fontSize: 22, fontWeight: '800', color: COLORS.text },
  lastUpdated:  { fontSize: 12, color: COLORS.subtext, marginBottom: 12 },
  intro:        { fontSize: 13, color: COLORS.text, lineHeight: 20, marginBottom: 20,
                  backgroundColor: COLORS.primary + '10', borderRadius: 10, padding: 12 },
  section:      { marginBottom: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: COLORS.text, marginBottom: 8 },
  sectionBody:  { fontSize: 13, color: COLORS.subtext, lineHeight: 21 },
  rtl:          { textAlign: 'right', writingDirection: 'rtl' },
  footer:       { backgroundColor: '#FFF9E6', borderRadius: 12, padding: 14,
                  borderWidth: 1.5, borderColor: COLORS.secondary + '55', marginBottom: 30 },
  footerText:   { fontSize: 12, color: COLORS.text, lineHeight: 18 },
});
