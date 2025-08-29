// 1. Danh sách 12 nhân viên giả
const employees = [
  {employeeId: 1, name: 'Lê Quang Thái'},
  {employeeId: 2, name: 'Hoàng Quốc Đạt'},
  {employeeId: 3, name: 'Nguyễn Quang Trường'},
  {employeeId: 4, name: 'Phạm Thị Dung'},
  {employeeId: 5, name: 'Hoàng Văn Long'},
  {employeeId: 6, name: 'Đỗ Thị Linh'},
  {employeeId: 7, name: 'Bùi Văn Hoàng'},
  {employeeId: 8, name: 'Vũ Thị Hạnh'},
  {employeeId: 9, name: 'Đặng Văn Nam'},
  {employeeId: 10, name: 'Ngô Thị Trang'},
  {employeeId: 11, name: 'Phan Văn Bình'},
  {employeeId: 12, name: 'Trịnh Thị Thảo'},
];

// 2. Hàm random trong khoảng [min, max]
function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 3. Hàm lấy ngày random giữa 01/01/2025 và 28/03/2025
function getRandomDate() {
  const start = new Date(2025, 0, 1).getTime(); // 2025-01-01
  const end = new Date(2025, 2, 28).getTime(); // 2025-03-28
  const randomTime = randomInt(start, end);
  return new Date(randomTime);
}

// 4. Tạo 50 dòng dữ liệu Attendances
export function generateFakeAttendances(count = 50) {
  const attendances = [];

  for (let i = 1; i <= count; i++) {
    // Chọn ngẫu nhiên 1 nhân viên
    const emp = employees[randomInt(0, employees.length - 1)];

    // Random ngày checkin
    const checkinDate: any = getRandomDate();
    // Giả sử checkin từ 7h -> 9h
    checkinDate.setHours(randomInt(7, 9));
    checkinDate.setMinutes(randomInt(0, 59));

    // Tạo checkout = checkin + (8 -> 10 tiếng)
    const checkoutDate: any = new Date(checkinDate.getTime());
    const randomHours = randomInt(8, 10); // làm việc 8-10 tiếng
    checkoutDate.setHours(checkinDate.getHours() + randomHours);
    checkoutDate.setMinutes(checkinDate.getMinutes() + randomInt(0, 30));

    // Tính tổng giờ làm
    const diffMs = checkoutDate - checkinDate; // mili giây
    const totalHours = +(diffMs / (1000 * 60 * 60)).toFixed(2); // làm tròn 2 chữ số thập phân

    // work_date = YYYY-MM-DD (theo ngày checkin)
    const workDate = checkinDate.toISOString().split('T')[0];

    // Giả sử createdAt, updatedAt bằng thời điểm checkin
    const createdAt = checkinDate.toISOString();
    const updatedAt = checkinDate.toISOString();

    attendances.push({
      id: i,
      employee: {
        employeeId: emp.employeeId,
        name: emp.name,
      },
      checkin: checkinDate.toISOString(), // dạng "2025-xx-xxTxx:xx:xxZ"
      checkout: checkoutDate.toISOString(),
      total_hours: totalHours,
      employee_request_id: null,
      over_time: 0,
      isPenalty: 0,
      work_date: workDate,
      createdAt,
      updatedAt,
      createdBy: 1, // ví dụ
      updatedBy: 1, // ví dụ
    });
  }

  return attendances;
}
