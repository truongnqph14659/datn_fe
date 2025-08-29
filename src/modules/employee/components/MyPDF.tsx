import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { Font } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 50, fontSize: 12, fontFamily: 'TimesNewRoman' },
  section: { marginBottom: 10, lineHeight: 1.5, },
  title: { textAlign: 'center', fontSize: 14, fontWeight: 'bold' },
  subtitle: { textAlign: 'center', marginBottom: 10 },
  table: { Display: "table", width: "auto", borderStyle: "solid", borderWidth: 1, borderRightWidth: 0, borderBottomWidth: 0 },
  tableRow: { flexDirection: "row" },
  tableColHeader: { width: "25%", borderStyle: "solid", borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0, backgroundColor: '#eee', padding: 4},
  tableCol: { width: "25%", borderStyle: "solid", borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0, padding: 4 },
  tableCell: { fontSize: 10 },
  signatureSection: { marginTop: 30, flexDirection: 'row', justifyContent: 'space-between' },
  signatureSectionDetail:{
    textAlign:"center",
    alignItems:"center"
  }
});
Font.register({
  family: 'TimesNewRoman',
  src: '/fonts/times.ttf',
});

type Props = {
  data: any;
};

const WorkHistoryPDF: React.FC<Props> = ({ data }) => {
  return (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={{ textAlign: 'center', fontSize: 12 }}>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</Text>
      <Text style={{ textAlign: 'center', fontSize: 12 }}>Độc lập - Tự do - Hạnh phúc</Text>
      <Text style={{ textAlign: 'center', fontSize: 12 }}>----------------</Text>
      <Text style={styles.title}>BẢN KHAI QUÁ TRÌNH CÔNG TÁC</Text>
      <View style={styles.section}>
        <Text>I. THÔNG TIN CHUNG</Text>
        <Text>Họ và tên: {data.name}</Text>
        <Text>Số CMND/CCCD: {data.idNumber}</Text>
        <Text>Địa chỉ: {data.address}</Text>
        <Text>Đơn vị công tác: {data.company}</Text>
        <Text>Phòng ban: {data.department}</Text>
        <Text>Chức vụ hiện tại: {data.position}</Text>
      </View>
      <View>
        <Text>II. QUÁ TRÌNH CÔNG TÁC</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={[styles.tableColHeader,{ width: "20%" }]}><Text style={styles.tableCell}>Loại hợp đồng</Text></View>
            <View style={[styles.tableColHeader,{ width: "25%" }]}><Text style={styles.tableCell}>Thời gian</Text></View>
            <View style={styles.tableColHeader}><Text style={styles.tableCell}>Chức vụ, đơn vị</Text></View>
            <View style={[styles.tableColHeader, { width: "40%" }]}><Text style={styles.tableCell}>Nội dung công việc</Text></View>
          </View>
          {data.workHistory.map((item:any, index:number) => (
            <View style={styles.tableRow} key={index}>
              <View style={[styles.tableCol,{ width: "20%" }]}><Text style={styles.tableCell}>{item.contract_type}</Text></View>
              <View style={[styles.tableCol,{ width: "25%" }]}><Text style={styles.tableCell}>{item.time}</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{item.position}</Text></View>
              <View style={[styles.tableCol, { width: "40%" }]}><Text style={styles.tableCell}>{item.description}</Text></View>
            </View>
          ))}
        </View>
      </View>
      <View>
        <Text style={{marginTop:15}}>Tôi xin cam đoan nội dung bản khai này là đúng sự thật, nếu sai tôi hoàn toàn chịu trách nhiệm trước pháp luật.</Text>
      </View>
      <View style={styles.signatureSection}>
        <View style={styles.signatureSectionDetail}>
          <Text>XÁC NHẬN CỦA TỔ CHỨC QUẢN LÝ TRỰC TIẾP</Text>
          <Text>(Chức vụ, ký, họ tên, đóng dấu)</Text>
        </View>
        <View style={styles.signatureSectionDetail}>
          <Text>NGƯỜI KHAI</Text>
          <Text>(Ký, họ tên)</Text>
        </View>
      </View>
    </Page>
  </Document>
  )
}


export default WorkHistoryPDF;
