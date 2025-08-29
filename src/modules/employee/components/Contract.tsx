import {forwardRef, useEffect, useImperativeHandle, useState} from 'react';
import {Button, Card, Col, DatePicker, Form, Row, Select} from 'antd';
import {CloseOutlined, InboxOutlined} from '@ant-design/icons';
import TextArea from 'antd/es/input/TextArea';
import Dragger from 'antd/es/upload/Dragger';
import {IEmployeeRes} from '@/shared/types/employee.type';
import dayjs from 'dayjs';
import {useAuthStore} from '@/store/authStore';
interface ContractProps {
  onMounted: () => void;
  employee: IEmployeeRes | null;
}

const Contract = forwardRef(({onMounted, employee}: ContractProps, ref) => {
  const [form] = Form.useForm();
  const user = useAuthStore((s) => s.user);
  const [form_recontract] = Form.useForm();
  const [isBtnSubcontract, setIsBtnSubcontract] = useState<boolean>(true);

  useEffect(() => {
    onMounted();
  }, []);

  useImperativeHandle(ref, () => ({
    validate: () => (employee == null ? form.validateFields() : form_recontract.validateFields()),
    getData: () => (employee == null ? form.getFieldsValue() : form_recontract.getFieldsValue()),
  }));

  const initialDataSource = {
    contract:
      employee === null
        ? [
            {
              contract_type: 'TERM_1_YEAR',
              note: '',
              'range-picker': [],
              contract_files: '',
              sub_contract: [],
            },
          ]
        : employee?.contract?.filter((contract:any)=>contract.status=='ACTIVE').map((contract_item: any) => {
            return {
              contract_type: contract_item.contract_type,
              note: contract_item.note,
              link: contract_item.url_contract,
              'range-picker': [dayjs(contract_item.start_date), dayjs(contract_item.end_date)],
              sub_contract: contract_item?.contract_appendices?.map((sub_contract_item: any) => {
                return {
                  sub_contract_type: sub_contract_item.change_type,
                  sub_note: sub_contract_item.note,
                  link:sub_contract_item.url_sub_contract
                };
              }),
            };
          }),
  };
  const {RangePicker} = DatePicker;

  const handleBeforeUpload = (file: File) => {
    form.setFieldsValue({image: file});
    return false;
  };


  return (
    <Row className={employee !== null && user?.roles.name === 'Admin' ? 'justify-around' : ''}>
      <Col span={11} className="overflow-y-auto overflow-x-hidden max-h-[600px]">
        <Form
          labelCol={{span: 6}}
          form={form}
          name="dynamic_form_complex_contract"
          autoComplete="off"
          initialValues={initialDataSource}
        >
          <Form.List name="contract">
            {(fields) => (
              <div style={{display: 'flex', rowGap: 16, flexDirection: 'column'}}>
                {fields.map((field,contractIndex) => (
                  <div key={field.key}>
                    <Form.Item name={[field.name, 'contract_type']}>
                      <Select
                        style={{width: '100%'}}
                        optionFilterProp="label"
                        disabled={employee ? true : false}
                        options={[
                          {
                            value: 'PROBATION ',
                            label: 'Hợp đồng thử việc',
                          },
                          {
                            value: 'TERM_1_YEAR',
                            label: 'Hợp đồng có thời hạn 1 năm',
                          },
                          {
                            value: 'TERM_2_YEARS',
                            label: 'Hợp đồng có thời hạn 2 năm',
                          },
                          {
                            value: 'CUSTOM',
                            label: 'Hợp đồng tùy chọn thời hạn',
                          },
                          {
                            value: 'UNLIMITED',
                            label: 'Hợp đồng không xác định thời hạn',
                          },
                          {
                            value: 'INTERNSHIP',
                            label: 'Hợp đồng thực tập',
                          },
                          {
                            value: 'SEASONAL',
                            label: 'Hợp đồng thời vụ',
                          },
                        ]}
                      />
                    </Form.Item>
                    <Form.Item name={[field.name, 'range-picker']}>
                      <RangePicker
                        style={{width: '100%'}}
                        disabled={employee ? true : false}
                        placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
                        format="DD-MM-YYYY"
                      />
                    </Form.Item>

                    {!employee && (
                      <Form.Item
                        name={[field.name, 'contract_files']}
                        valuePropName="contract_files"
                        getValueFromEvent={(e) => e && e.fileList}
                      >
                        <Dragger
                          multiple={false}
                          beforeUpload={handleBeforeUpload}
                          maxCount={1}
                          name="contract_files"
                          onRemove={() => {
                            form.setFieldsValue({image: null});
                            form.validateFields(['contract_files']);
                          }}
                        >
                          <p className="ant-upload-drag-icon">
                            <InboxOutlined />
                          </p>
                          <p className="ant-upload-text">Click or drag file để upload tài liệu hợp đồng</p>
                        </Dragger>
                      </Form.Item>
                    )}

                    <Form.Item name={[field.name, 'note']}>
                      <TextArea rows={2} placeholder="ghi chú cho hợp đồng" disabled={employee ? true : false} />
                    </Form.Item>
                    <Form.Item>
                      <a
                        href={form.getFieldValue(['contract', field.name, 'link'])}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {form.getFieldValue(['contract', field.name, 'link'])}
                      </a>
                    </Form.Item>
                    <Form.Item>
                      <Form.List name={[field.name, 'sub_contract']}>
                        {(subFields, {add, remove}) => (
                          <div style={{display: 'flex', flexDirection: 'column', rowGap: 16}}>
                            {subFields.map((subField) => {
                              return (
                                <div key={subField.key}>
                                  <div style={{display: 'flex', margin: '10px 0'}}>
                                    <Form.Item
                                      name={[subField.name, 'sub_contract_type']}
                                      style={{marginBottom: 0, width: '100%'}}
                                    >
                                      <Select
                                        placeholder="Loại phụ lục"
                                        style={{width: '100%'}}
                                        optionFilterProp="label"
                                        disabled={employee ? true : false}
                                        options={[
                                          {
                                            value: 'SALARY',
                                            label: 'Thay đổi chế độ lương thưởng',
                                          },
                                          {
                                            value: 'POSISON',
                                            label: 'Thay đổi vai trò chức danh',
                                          },
                                          {
                                            value: 'WORKING_LOCATION',
                                            label: 'Thay đổi vị trí tính chất công việc',
                                          },
                                          {
                                            value: 'OTHER',
                                            label: 'Khác',
                                          },
                                        ]}
                                      />
                                    </Form.Item>
                                    <CloseOutlined
                                      onClick={() => {
                                        remove(subField.name);
                                        setIsBtnSubcontract(true);
                                      }}
                                    />
                                  </div>
                                  <Form.Item noStyle name={[subField.name, 'sub_note']}>
                                    <TextArea
                                      rows={2}
                                      placeholder="ghi chú cho phụ lục"
                                      style={{width: '96%'}}
                                      disabled={employee ? true : false}
                                    />
                                  </Form.Item>
                                  <Form.Item shouldUpdate>
                                    {() => {
                                      const link = form.getFieldValue([
                                        'contract',
                                        contractIndex,
                                        'sub_contract',
                                        subField.name,
                                        'link',
                                      ]);
                
                                      return link ? (
                                        <a href={link} target="_blank" rel="noopener noreferrer">
                                          {link}
                                        </a>
                                      ) : null;
                                    }}
                                  </Form.Item>
                                  {!employee && (
                                    <Form.Item
                                      name={[subField.name, 'sub_contract_files']}
                                      valuePropName="sub_contract_files"
                                      getValueFromEvent={(e) => e && e.fileList}
                                    >
                                      <Dragger
                                        style={{width: '96%', margin: '10px 0'}}
                                        multiple={true}
                                        beforeUpload={handleBeforeUpload}
                                        name="sub_contract_files"
                                        onRemove={() => {
                                          form.setFieldsValue({image: null});
                                          form.validateFields(['sub_contract_files']);
                                        }}
                                      >
                                        <p className="ant-upload-text">
                                          Click or drag file để upload tài liệu phụ lục hợp đồng
                                        </p>
                                      </Dragger>
                                    </Form.Item>
                                  )}
                                </div>
                              );
                            })}
                            <Button
                              type="dashed"
                              disabled={employee ? true : false}
                              onClick={() => {
                                add();
                                setIsBtnSubcontract(false);
                              }}
                              block
                              style={{display: !isBtnSubcontract ? 'none' : 'block'}}
                            >
                              + Thêm Phụ Lục
                            </Button>
                          </div>
                        )}
                      </Form.List>
                    </Form.Item>
                  </div>
                ))}
              </div>
            )}
          </Form.List>
        </Form>
      </Col>
      {employee !== null && user?.roles.name === 'Admin' && (
        <Col span={11}>
          <Card title="Thêm mới hợp đồng" variant="borderless">
            <Form
              labelCol={{span: 6}}
              form={form_recontract}
              name="dynamic_form_complex_reContract"
              autoComplete="off"
              initialValues={{
                contract: [
                  {
                    contract_type: '',
                    note: '',
                    'range-picker': [],
                    contract_files: '',
                    sub_contract: [],
                  },
                ],
              }}
            >
              <Form.List name="contract">
                {(fields) => (
                  <div style={{display: 'flex', rowGap: 16, flexDirection: 'column'}}>
                    {fields.map((field) => (
                      <div key={field.key}>
                        <Form.Item name={[field.name, 'contract_type']}>
                          <Select
                            style={{width: '100%'}}
                            optionFilterProp="label"
                            options={[
                              {
                                value: 'PROBATION ',
                                label: 'Hợp đồng thử việc',
                              },
                              {
                                value: 'TERM_1_YEAR',
                                label: 'Hợp đồng có thời hạn 1 năm',
                              },
                              {
                                value: 'TERM_2_YEARS',
                                label: 'Hợp đồng có thời hạn 2 năm',
                              },
                              {
                                value: 'CUSTOM',
                                label: 'Hợp đồng tùy chọn thời hạn',
                              },
                              {
                                value: 'UNLIMITED',
                                label: 'Hợp đồng không xác định thời hạn',
                              },
                              {
                                value: 'INTERNSHIP',
                                label: 'Hợp đồng thực tập',
                              },
                              {
                                value: 'SEASONAL',
                                label: 'Hợp đồng thời vụ',
                              },
                            ]}
                          />
                        </Form.Item>
                        <Form.Item name={[field.name, 'range-picker']}>
                          <RangePicker
                            style={{width: '100%'}}
                            placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
                            format="DD-MM-YYYY"
                          />
                        </Form.Item>
                        <Form.Item
                          name={[field.name, 'contract_files']}
                          valuePropName="contract_files"
                          getValueFromEvent={(e) => e && e.fileList}
                        >
                          <Dragger
                            multiple={false}
                            beforeUpload={handleBeforeUpload}
                            maxCount={1}
                            name="contract_files"
                            onRemove={() => {
                              form.setFieldsValue({image: null});
                              form.validateFields(['contract_files']);
                            }}
                          >
                            <p className="ant-upload-drag-icon">
                              <InboxOutlined />
                            </p>
                            <p className="ant-upload-text">Click or drag file để upload tài liệu hợp đồng</p>
                          </Dragger>
                        </Form.Item>
                        <Form.Item name={[field.name, 'note']}>
                          <TextArea rows={2} placeholder="ghi chú cho hợp đồng" />
                        </Form.Item>
                        <Form.Item>
                          <Form.List name={[field.name, 'sub_contract']}>
                            {(subFields, {add, remove}) => (
                              <div style={{display: 'flex', flexDirection: 'column', rowGap: 16}}>
                                {subFields.map((subField) => {
                                  return (
                                    <div key={subField.key}>
                                      <div style={{display: 'flex', margin: '10px 0'}}>
                                        <Form.Item
                                          name={[subField.name, 'sub_contract_type']}
                                          style={{marginBottom: 0, width: '100%'}}
                                        >
                                          <Select
                                            placeholder="Loại phụ lục"
                                            style={{width: '100%'}}
                                            optionFilterProp="label"
                                            options={[
                                              {
                                                value: 'SALARY',
                                                label: 'Thay đổi chế độ lương thưởng',
                                              },
                                              {
                                                value: 'POSISON',
                                                label: 'Thay đổi vai trò chức danh',
                                              },
                                              {
                                                value: 'WORKING_LOCATION',
                                                label: 'Thay đổi vị trí tính chất công việc',
                                              },
                                              {
                                                value: 'OTHER',
                                                label: 'Khác',
                                              },
                                            ]}
                                          />
                                        </Form.Item>
                                        <CloseOutlined
                                          onClick={() => {
                                            remove(subField.name);
                                            setIsBtnSubcontract(true);
                                          }}
                                        />
                                      </div>
                                      <Form.Item noStyle name={[subField.name, 'sub_note']}>
                                        <TextArea rows={2} placeholder="ghi chú cho phụ lục" style={{width: '96%'}} />
                                      </Form.Item>
                                      <Form.Item
                                        name={[subField.name, 'sub_contract_files']}
                                        valuePropName="sub_contract_files"
                                        getValueFromEvent={(e) => e && e.fileList}
                                      >
                                        <Dragger
                                          style={{width: '96%', margin: '10px 0'}}
                                          multiple={true}
                                          beforeUpload={handleBeforeUpload}
                                          name="sub_contract_files"
                                          onRemove={() => {
                                            form.setFieldsValue({image: null});
                                            form.validateFields(['sub_contract_files']);
                                          }}
                                        >
                                          <p className="ant-upload-text">
                                            Click or drag file để upload tài liệu phụ lục hợp đồng
                                          </p>
                                        </Dragger>
                                      </Form.Item>
                                    </div>
                                  );
                                })}
                                <Button
                                  type="dashed"
                                  onClick={() => {
                                    add();
                                    setIsBtnSubcontract(false);
                                  }}
                                  block
                                  style={{display: !isBtnSubcontract ? 'none' : 'block'}}
                                >
                                  + Thêm Phụ Lục
                                </Button>
                              </div>
                            )}
                          </Form.List>
                        </Form.Item>
                      </div>
                    ))}
                  </div>
                )}
              </Form.List>
            </Form>
          </Card>
        </Col>
      )}
    </Row>
  );
});

export default Contract;
