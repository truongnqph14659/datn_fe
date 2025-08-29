import ModalGlobal from '@/components/ModalGlobal';
import {QUERY_KEYS} from '@/shared/constants/query-key';
import {useUpdateEmployeeWorkSchedule} from '@/shared/hooks/react-query-hooks/employee';
import {useQueryClient} from '@tanstack/react-query';
import {Button, Flex, Form, InputNumber, Modal, Select, Space, TimePicker} from 'antd';
import {AxiosError} from 'axios';
import {useEffect, useMemo, useRef, useState} from 'react';
import {toast} from 'react-toastify';
import {ClockCircleOutlined, SyncOutlined} from '@ant-design/icons';
import {IEmployeeRes} from '@/shared/types/employee.type';
import dayjs from 'dayjs';
import 'jqwidgets-scripts/jqwidgets/styles/jqx.base.css';
import JqxGrid, {IGridProps, jqx} from 'jqwidgets-scripts/jqwidgets-react-tsx/jqxgrid';
interface ModalCreateEmployeeProps {
  isModalVisible: boolean;
  toggleModal: () => void;
  dataUpload: any;
  dataEmpList?:any
}

const TableEmployeeSchedule = ({isModalVisible, toggleModal, dataUpload,dataEmpList}: ModalCreateEmployeeProps) => {
  const {mutateAsync: UpdateEmployeeWorkingTime} = useUpdateEmployeeWorkSchedule();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [gridVisible, setGridVisible] = useState(false);
  const [gridEmpVisible, setGridEmpVisible] = useState(false);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const dataEmpDestructuring = dataEmpList.data.map((emp:any)=>{
      return {
        employeeId:emp._id,
        name:emp.name,
        department:emp.department.name_depart
      }
  })
  const dataRef = useRef<any[]>([...dataUpload]);
  const dataEmpRef = useRef<any[]>([...dataEmpDestructuring]);
  const gridRef = useRef<any>(null);
  const gridEmployeeRef = useRef<any>(null);
  const source = useMemo(
    () => {
      return {
        localdata: dataRef.current,
        datatype: 'array',
      }
    },
    []
  );
  const sourceEmp = useMemo(
    () => ({
      localdata: dataEmpRef.current,
      datatype: 'array',
    }),
    []
  );

  const dataAdapter = useMemo(() => new jqx.dataAdapter(source), []);
  const dataEmp = useMemo(()=> new jqx.dataAdapter(sourceEmp),[])

  useEffect(() => {
    const interval = setInterval(() => {
      const el = document.querySelector("span[id^='jqxWidget']") as HTMLSpanElement;
      if (el && el.innerText.includes('www.jqwidgets.com')) {
        el.remove();
      }
      clearInterval(interval);
    }, 100);
    if (isModalVisible) {
      setTimeout(() => {
        setGridVisible(true);
      }, 0);
    }
    if (isEmployeeModalOpen) {
      setTimeout(() => {
        setGridEmpVisible(true);
      }, 0);
    }
    // Dọn dẹp khi unmount
    return () => clearInterval(interval);
  }, [isModalVisible, isEmployeeModalOpen]);

  const columns: IGridProps['columns'] = [
    {
      text: 'Mã nhân viên',
      datafield: 'employeeId',
      width: '15%',
      cellsalign: 'center',
      align: 'center',
    },
    {
      text: 'Tên nhân viên',
      datafield: 'name',
      width: '30%',
      cellsalign: 'center',
      align: 'center',
    },
    {
      text: 'Phòng ban',
      datafield: 'department',
      width: '10%',
      cellsalign: 'center',
      align: 'center',
    },
    {
      text: 'Giờ bắt đầu',
      datafield: 'shiftStart',
      width: '15%',
      cellsalign: 'center' as 'center',
      columntype: 'datetimeinput',
      cellsformat: 'HH:mm',
      createeditor: (row, cellvalue, editor) => {
        editor.jqxDateTimeInput({
          formatString: 'HH:mm',
          showTimeButton: true,
          showCalendarButton: false,
        });
      },
    },
    {
      text: 'Giờ kết thúc',
      datafield: 'shiftEnd',
      width: '15%',
      cellsalign: 'center' as 'center',
      columntype: 'datetimeinput',
      cellsformat: 'HH:mm',
      createeditor: (row, cellvalue, editor) => {
        editor.jqxDateTimeInput({
          formatString: 'HH:mm',
          showTimeButton: true,
          showCalendarButton: false,
        });
      },
    },
    {
      text: 'Nghỉ (phút)',
      datafield: 'breakTime',
      width: '10%',
      cellsalign: 'right' as 'right',
      columntype: 'dropdownlist',
      createeditor: (row, cellvalue, editor) => {
        editor.jqxDropDownList({
          source: Array.from({length: 61}, (_, i) => ({
            label: i.toString(),
            value: i,
          })),
          autoDropDownHeight: false,
          displayMember: 'label',
          valueMember: 'value',
          dropDownHeight: 200,
        });
        setTimeout(() => {
          editor.jqxDropDownList('open');
        }, 0);
      },
    },
  ];

  const columnsEmployee: IGridProps['columns'] = [
    {
      text: 'Mã nhân viên',
      datafield: 'employeeId',
      width: '20%',
      cellsalign: 'center',
      align: 'center',
    },
    {
      text: 'Tên nhân viên',
      datafield: 'name',
      width: '50%',
      cellsalign: 'center',
      align: 'center',
    },
    {
      text: 'Phòng ban',
      datafield: 'department',
      width: '30%',
      cellsalign: 'center',
      align: 'center',
    },
  ];

  const addRowClick = () => {
    const newRow = {
      employeeId: null,
      name: null,
      department: null,
      shiftStart: null,
      shiftEnd: null,
      breakTime: 0,
    };
    dataRef.current.push(newRow);
    gridRef.current?.addrow?.(null, newRow);
  };

  const deleteSelectedRows = () => {
    const selectedRowIndexes = gridRef.current?.getselectedrowindexes?.() || [];
    const sortedIndexes = [...selectedRowIndexes].sort((a, b) => b - a);
    sortedIndexes.forEach((index) => {
      const rowId = gridRef.current?.getrowid?.(index);
      gridRef.current?.deleterow?.(rowId);
      if (index >= 0 && index < dataRef.current.length) {
        dataRef.current.splice(index, 1);
      }
    });
    gridRef.current?.clearselection?.();
  };

  const handleBeginEdit = (e: any) => {
    const datafield = e.args.datafield;
    const rowindex = e.args.rowindex;
    if (datafield === 'employeeId' || datafield === 'name' || datafield === 'department') {
      e.args.cancel = true;
      gridRef.current?.clearselection?.();
      gridRef.current?.selectrow?.(rowindex);
      const rowId = gridRef.current?.getrowid(rowindex);
      setEditingRowIndex(rowId);
      setIsEmployeeModalOpen(true);
    }
  };

  const handleSingleSelection = (event: any) => {
    const grid = gridEmployeeRef.current;
    const selectedIndexes = grid.getselectedrowindexes();
    // Nếu chọn tất cả → chỉ giữ dòng vừa chọn
    if (selectedIndexes.length > 1) {
      selectedIndexes.forEach((index: number) => {
        if (index !== event.args.rowindex) {
          grid.unselectrow(index);
        }
      });
    }
  };

  const handleSaveToDatabase = async () => {
    setIsLoading(true)
    const allRows = gridRef.current?.getrows?.() || [];
    if(allRows.length === 0) return toast.error('Có lỗi xảy ra');
    const keysToSend = ['employeeId', 'name', 'shiftStart', 'shiftEnd', 'breakTime','department'];
    let isMissingData = false
    const cleanedRows = allRows.map((row:any) => {
      const filtered: Record<string, any> = {};
      keysToSend.forEach(key => { 
        if(!isMissingData && row[key] === undefined){
          isMissingData=true
        }
        filtered[key] = row[key] || null
      });
      return filtered;
    });
    if(isMissingData) return toast.error('Check, có trường thiếu thông tin!');
    const dataUpload = {
      type:'upload_excel',
      data:cleanedRows
    }
    await UpdateEmployeeWorkingTime(dataUpload,{
      onSuccess(data) {
        toast.success(data?.message);
        setIsLoading(false)
        toggleModal();
        queryClient.invalidateQueries([QUERY_KEYS.EXPORT_EXCEL_WORK_SCHEDULE] as any);
      },
      onError(error){
        if(error instanceof AxiosError){
            toast.error(error.response?.data.message);
        }
      }
    })
  };

  return (
    <>
      <Modal
        open={isModalVisible}
        onCancel={() => {
          setGridVisible(false);
          toggleModal();
        }}
        onOk={() => {
          handleSaveToDatabase();
        }}
        confirmLoading={isLoading}
        okButtonProps={{
          disabled: isLoading,
        }}
        width={'60%'}
        destroyOnClose={true}
        closable={false}
      >
        <Flex gap="small" className="py-2" wrap>
          <Button type="primary" onClick={addRowClick}>
            Thêm dòng
          </Button>
          <Button danger onClick={deleteSelectedRows}>
            Xoá dòng
          </Button>
        </Flex>
        {gridVisible && (
          <JqxGrid
            ref={gridRef}
            width="100%"
            height={400}
            source={dataAdapter}
            columns={columns}
            editable={true}
            editmode={'dblclick'}
            selectionmode={'checkbox'}
            onCellbeginedit={(e) => handleBeginEdit(e)}
          />
        )}
      </Modal>
      <Modal
        open={isEmployeeModalOpen}
        onCancel={() => {
          gridEmployeeRef.current?.clearselection?.()
          setIsEmployeeModalOpen(false)
        }}
        onOk={() => {
          const selectedIndexes = gridEmployeeRef.current?.getselectedrowindexes?.();
          const selectedRowData = gridEmployeeRef.current?.getrowdata?.(selectedIndexes);
          // Gán lại vào dòng đang chỉnh sửa trong dataRef
          if (editingRowIndex !== null && selectedRowData) {
            dataRef.current[editingRowIndex] = {
              ...dataRef.current[editingRowIndex],
              employeeId: selectedRowData.employeeId,
              name: selectedRowData.name,
              department: selectedRowData.department,
            };
          }
          gridEmployeeRef.current?.clearselection?.()
          setIsEmployeeModalOpen(false)
        }}
        title="Chọn nhân viên"
      >
        {gridEmpVisible && (
          <JqxGrid
            ref={gridEmployeeRef}
            width="100%"
            height={400}
            source={dataEmp}
            columns={columnsEmployee}
            editable={false}
            selectionmode={'checkbox'}
            showheader={false}
            onRowselect={handleSingleSelection}
          />
        )}
      </Modal>
    </>
  );
};

export default TableEmployeeSchedule;
