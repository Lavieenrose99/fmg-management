/* eslint-disable camelcase */
import {
  Form, Input, Button, Select,
  Checkbox, InputNumber, DatePicker,
  Divider, Upload, Modal, Steps, Radio, Switch, Space, Table, Result
} from 'antd';
import { PlusOutlined, UploadOutlined, SmileOutlined } from '@ant-design/icons';
import moment, { isMoment } from 'moment';
import { get } from 'lodash';
import React, {
  useState, useEffect, useRef,
} from 'react';
import FormItem from 'antd/lib/form/FormItem';
import { connect } from 'umi';
import TextArea from 'antd/lib/input/TextArea';
import request from '@/utils/request';
import PropTypes from 'prop-types';
import RichTextEditor from '../../utils/RichTextEditor.jsx';
import '../../style/GoodsAddEditor.less';

const { Option, OptGroup } = Select;
const layout = {
  labelCol: {
    offset: 4,
  },
  wrapperCol: {
    span: 12,
  },
};
const ModelListlayout = {
  labelCol: {
    offset: 10,
  },
};
const EditorLayout = {
  wrapperCol: {
    offset: 4,
    //span: 8,
  },
};
const tailLayout = {
  wrapperCol: {
    offset: 8,
    span: 16,
  },
};

export const getaways = [{ id: 1, name: '快递' }, { id: 2, name: '同城配送' }, { id: 3, name: '自取' }];
export const putaways = [{ id: 1, name: '立即上架' }, { id: 2, name: '自定义上架时间' }, { id: 3, name: '放入仓库暂不上架' }];

const { Step } = Steps;

const GoodsAddEditor = (props) => {
  const [form] = Form.useForm();
  const [fromSpec] = Form.useForm();
  const QINIU_SERVER = 'http://upload-z2.qiniup.com';
  const BASE_QINIU_URL = 'http://qiniu.daosuan.net/';
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [fileList, setFileList] = useState(([JSON.parse(localStorage.getItem('FileList'))] ?? []));
  const [fileVidoList, setfileVidoList] = useState(([JSON.parse(localStorage.getItem('fileVidoList'))] ?? []));
  const [fileListAlot, setFileListAlot] = useState((JSON.parse(localStorage.getItem('FileListAlot')) ?? []));
  const {
    goodsArea, goodsSale,
    goodsClassChild, goodsClassFather,
    goodsModelsList, goodsModel,
  } = props;
  const formRef = useRef(null);
  const [checkUse, setCheckUse] = useState(false);
  const [goodsDetails, setGoodsDetails] = useState([]);
  const [qiniuToken, setQiniuToken] = useState('');
  const [richTextContent, setRichTextContent] = useState(localStorage.getItem('RichText'));
  const [rubbish, setRubbish] = useState([]);
  const [check, setCheck] = useState(false);
  const [storeageGoods, setStoreageGoods] = useState((JSON.parse(localStorage.getItem('storage')) ?? {}));
  const [submitGoods, setSubmitGoods] = useState([]);
  const [goodsModels, setgoodsModels] = useState([]);
  const [templateId, setTemplateId] = useState(0);
  const [goodID, setGoodsId] = useState(0);
  const [submitValues, setSumitvalues] = useState({});
  const [current, setCurrent] = useState(0);
  const ModelsName = (((goodsModel[0] || []).template || []).filter((arr) => {
    return arr.use !== false;
  }) || []).map((tem) => {
    return tem.name;
  });
  const ModelsColums = ModelsName.map((arr) => {
    return {
      title: arr,
      dataIndex: 'specification',
      render: (text, record) => (
        <span>
          {
           record.specification[arr]
         }
        </span> 
      ), 
    };
  });
  
  const detailsName = [{
    title: '规格',
    children: ModelsColums, 
  }, { title: '库存', dataIndex: 'total' },
  { title: '重量', dataIndex: 'weight' }, { title: '价格', dataIndex: 'price' },
  { title: '成本价', dataIndex: 'cost_price' }];
  const settingGoods = {
    title: '操作',
    dataIndex: goodsColumns,
    render: (text, record) => (
      <>
        <Space size="large">
          <a onClick={() => this.handleChange()}>修改</a>
          <a onClick={() => this.comfirmDelArea()}>删除</a>
        </Space>
      </>
    ),
  };
  const IconColums = {
    title: '图标',
    dataIndex: 'picture',
    render: (pictures) => (
      <div style={{ textAlign: 'center' }}>
        <img
          src={pictures ? BASE_QINIU_URL + pictures : null}
          alt={pictures} 
          style={{ width: 30, height: 30  }}
        />
      </div>
    ),
  };
  const goodsColumns = [...detailsName, IconColums, settingGoods];
  const handlePreview = (file) => {
    setPreviewImage(file.url || file.thumbUrl);
    setPreviewVisible(true);
  };
  const getQiNiuToken = () => {
    request('/api.farm/goods/resources/qiniu/upload_token', {
      method: 'GET',
    }).then(
      (response) => {
        setQiniuToken(response.token);
      }
    );
  };
  const getUploadToken = () => {
    getQiNiuToken();
  };
  const handleChange = ({ file  }) => {
    const {
      uid, name, type, thumbUrl, status, response = {},
    } = file;
    const fileItem = {
      uid,
      name,
      type,
      thumbUrl,
      status,
      response,
      url: BASE_QINIU_URL + (response.key || ''),
    };
    setPreviewImage(fileItem.url);
    setFileList([fileItem]);
    localStorage.setItem('FileList', JSON.stringify(fileItem));
  };
  const handleVidoChange = ({ file  }) => {
    const {
      uid, name, type, thumbUrl, status, response = {},
    } = file;
    //存储格式必须是mp4
    const fileItem = {
      uid,
      name,
      type,
      thumbUrl,
      status,
      response,
      url: BASE_QINIU_URL + (response.key || ''),
    };
    localStorage.setItem('fileVidoList', JSON.stringify(fileItem));
    setfileVidoList([fileItem]);
  };

  const handleChangeAlot = ({ file  }) => {
    const {
      uid, name, type, thumbUrl, status, response = {},
    } = file;
    const fileItem = {
      uid,
      name,
      type,
      thumbUrl,
      status,
      response,
      judege: (response.key || ''),
      url: BASE_QINIU_URL + (response.key),
    };

    if (fileItem.judege.length !== 0) {
      fileListAlot.pop();
      fileListAlot.pop();
      fileListAlot.push(fileItem);
    } else if (fileItem.status !== 'error') {
      fileListAlot.push(fileItem);
    }
    localStorage.setItem('FileListAlot', JSON.stringify(fileListAlot));
    setFileListAlot([...fileListAlot]);
  };

  const uploadButton = (
    <div>
      <div className="ant-upload-text">
        <UploadOutlined />
        上传
      </div>
    </div>
  );
  
  const subscribeRichText = (text) => {
    localStorage.setItem('RichText', text);
    setRichTextContent(text);
  };
  
  useEffect(() => {
    getQiNiuToken();
  }, [fileListAlot]);
 
  useEffect(() => {
    fromSpec.setFieldsValue({
      specification: [''],
    });
  }, []);
  useEffect(() => {
    const { goodId } = props;
    setGoodsId(goodId.id);
  }, []);

  useEffect(() => {
    props.dispatch({
      type: 'goodsArea/fetchAreaTags',
      payload: { page: 1, limit: 99 },
    });
    props.dispatch({
      type: 'goodsSale/fetchSaleTags',
      payload: { page: 1, limit: 99 },
    });
    props.dispatch({
      type: 'goodsClass/fetchClassTags',
      payload: { page: 1, limit: 99 },
    });
    props.dispatch({
      type: 'goodsModels/fetchModels',
      payload: { page: 1, limit: 99  },
    });
  }, []);
  const subscriptions = (values) => {
    if (values) {
      const advance_time =  moment(values.advance_time).valueOf();
      const putaway_time = moment(values.putaway_time).valueOf();
      const timestap = {
        advance_time, putaway_time,
      };
      const Goods = storeageGoods;
      const newGoods = Object.assign(Goods, values, timestap);
      localStorage.setItem('storage', JSON.stringify(newGoods));
    }
  };
  const selectTemplate = (template) => {
    props.dispatch({
      type: 'goodsModels/getModelEntity',
      paload: template,
    });
    setTemplateId(template);
  };

  useEffect(() => {
    subscriptions();
    formRef.current.setFieldsValue({
      name: (storeageGoods.name ?? ''),
      price: storeageGoods.price,
      template_id: storeageGoods.template_id,
      paid_and_remove: (storeageGoods.paid_and_remove ?? false),
      show_total: (storeageGoods.show_total ?? false),
      exchange: (storeageGoods.exchange ?? false),
      sale_return: (storeageGoods.sale_return ?? false),
      advance: (storeageGoods.advance ?? false),
      advance_time: moment(moment(storeageGoods.advance_time)
        .format('YYYY-MM-DD HH:mm:ss'), 'YYYY-MM-DD HH:mm:ss'),
      on_sale: (storeageGoods.on_sale || false),
      sale: (storeageGoods.sale ?? true),
      get_way: storeageGoods.get_way,
      limit: (storeageGoods.limit || false),
      putaway: storeageGoods.putaway,
      putaway_time: moment(moment(storeageGoods.putaway_time)
        .format('YYYY-MM-DD HH:mm:ss'), 'YYYY-MM-DD HH:mm:ss'),
      sale_point: storeageGoods.sale_point,
      kind_tag: storeageGoods.kind_tag,
      sale_tag: storeageGoods.sale_tag,
      place_tag: (storeageGoods.place ?? []),
      total: storeageGoods.total,
      price_reduce: (storeageGoods.price_reduce),
      carriage: storeageGoods.carriage,
      min_sale: storeageGoods.min_sale,
      limit_total: storeageGoods.limit_total,
    });
  }, []);
  const subGoodsSpec = () => {
    props.dispatch({
      type: 'CreateGoods/createGoodsSpec',
      payload: {
        pid: props.goodId.id,
        specification: goodsDetails,
        template_id: templateId,
      },
    });
    localStorage.removeItem('FileList');
    setFileList([]);
    setCurrent(current + 1);
  };
  const addSpecification = (data) => {
    const spciArr = Object.values(data);
    const specification = spciArr[0][0];
    const picture = fileList[0].response.key;
    const specific = { specification, picture };
    const Finaldata = Object.assign(data, specific);
    setFileList([]);
    setPreviewImage('');
    setGoodsDetails([...goodsDetails, Finaldata]);
  };
  const submitSpc = () => {
    Modal.confirm({
      mask: false,
      title: '凤鸣谷',
      content: '确认提交商品信息吗',
      okText: '确认',
      cancelText: '取消',
      onOk: () => { subGoodsSpec(); },
    });
  };
  const subGoodsInfos = (subValues) => {
    localStorage.removeItem('storage');
    localStorage.removeItem('FileList');
    localStorage.removeItem('fileVidoList');
    localStorage.removeItem('FileListAlot');
    localStorage.removeItem('RichText');
    const { dispatch } = props;
    dispatch({
      type: 'CreateGoods/createGoods',
      payload: subValues,
    });
    setfileVidoList([]);
    setFileListAlot([]);
    setFileList([]);
    setRichTextContent('');
    setPreviewImage('');
    setSubmitGoods(subValues);
    setCurrent(current + 1);
  };
  const onFinish = (values) => {
    const advance_time =  moment(values.advance_time).valueOf();
    const putaway_time = moment(values.putaway_time).valueOf();
    const kind_tag = [values.kind_tag];
    const place_tag = [values.place_tag];
    const sale_tag = [values.sale_tag];
    const cover = fileList[0].response.key;
    const view = fileVidoList[0].response.key;
    const detail = richTextContent;
    const pictures = fileListAlot.map((arrFiles, index) => {
      return { picture: arrFiles.judege, order: index };
    });
    const timestap = {
      advance_time,
      putaway_time, 
      kind_tag,
      place_tag,
      sale_tag, 
      pictures,
      cover,
      view,
      detail,
    };
    const subValues = Object.assign(values, timestap);
    Modal.confirm({
      mask: false,
      title: '凤鸣谷',
      content: '确认提交商品信息吗',
      okText: '确认',
      cancelText: '取消',
      onOk: () => { subGoodsInfos(subValues); },
    });
  };
  return (
    <>
      <Steps
        type="navigation"
        current={current}
        className="site-navigation-steps"
      >
        <Step title="填写商品基本信息" />
        <Step title="完善商品规格信息" />
        <Step title="成功提交" />
      </Steps>
      <div className="steps-content">
        {
  (() => {
    if (current === 0) {
      return (<>
        <Divider orientation="left">商品基本信息</Divider>
        <Form
          onValuesChange={subscriptions}
          {...layout}
          form={form}
          ref={formRef}
          name="control-hooks"
          onFinish={onFinish}
          labelAlign="left"
        >
          <Form.Item
            name="name"
            label="商品名称"
            rules={[
              {
                required: true,
              }
            ]}
          >
            <Input
              placeholder="请输入商品名称"

            />
          </Form.Item>
          <Form.Item
            name="place_tag"
            label="商品分区"
            rules={[
              {
                required: true,
              }
            ]}
          >
            <Select
              placeholder="选择商品分区"
              allowClear
            >
              {goodsArea.map((arr) => {
                return  <Option value={arr.id} key={arr.id}>{arr.place}</Option>;
              })}

            </Select>
          </Form.Item>
          <Form.Item
            name="kind_tag"
            label="单品类别"
            rules={[
              {
                required: true,
              }
            ]}
          >
            <Select
              style={{ width: '40vw' }}
              placeholder="请选择商品类别"
            >
              {
                goodsClassFather.map((arr) => {
                  return <OptGroup label={arr.title}>
                    {(goodsClassChild.filter((tags) => {
                      return tags.parent_id === arr.id;
                    })).map((tag) => { return <Option value={tag.id}>{tag.title}</Option>; })}
                  </OptGroup>;
                })
              }
            </Select>
          </Form.Item>
          <Form.Item
            name="sale_point"
            label="商品卖点"
            rules={[
              {
                required: true,
              }
            ]}
          >
            <TextArea
              placeholder="简单描述商品"

            />
          </Form.Item>
          <Form.Item
            name="sale_tag"
            label="单品属性"
            rules={[
              {
                required: true,
              }
            ]}
          >
            <Radio.Group>
              {
                goodsSale.map((positions) => {
                  return <Radio
                    value={positions.id}
                  >
                    {positions.title}
                  </Radio>;
                })
              }
            </Radio.Group>
          </Form.Item>
          <Form.Item
            name="putaway"
            label="上架方式"
            rules={[
              {
                required: true,
              }
            ]}
          >
            <Radio.Group>
              {
                putaways.map((ways) => {
                  return <Radio value={ways.id}>{ways.name}</Radio>;
                })
              }
            </Radio.Group>
          </Form.Item>
          <Form.Item
            name="get_way"
            label="配送方式"
            rules={[
              {
                required: true,
              }
            ]}
          >
            <Radio.Group>
              {
                getaways.map((ways) => {
                  return <Radio value={ways.id}>{ways.name}</Radio>;
                })
              }
            </Radio.Group>
          </Form.Item>
          <Form.Item
            label="商品运费"
            name="carriage"
            rules={[
              {
                required: true,
              }
            ]}
          >
            <InputNumber
              style={{ minWidth: '10vw' }}
              formatter={(Goodvalues) => `¥ ${Goodvalues}`}
              parser={(Goodvalues) => Goodvalues.replace(/¥ \s?|(,*)/g, '')}
              min={0}
              step={0.01}
            />
          </Form.Item>
          <Form.Item
            label="商品数量设定"
            colon={false}
          >
            <Space size="large" style={{ marginLeft: 10 }}>
              <span>
                <span>限购数量: </span>
                <FormItem
                  name="limit_total"
                  noStyle
                  rules={[
                    {
                      required: true,
                    }
                  ]}
                >
                  <InputNumber  />
                </FormItem>
              </span>
              <span>
                <span>起售数量: </span>
                <FormItem
                  name="min_sale"
                  noStyle
                  rules={[
                    {
                      required: true,
                    }
                  ]}
                >
                  <InputNumber  />
                </FormItem>

              </span>
              <span>
                <span>库存数量: </span>
                <FormItem
                  name="total"
                  noStyle
                  rules={[
                    {
                      required: true,
                    }
                  ]}
                >
                  <InputNumber  />
                </FormItem>
              </span>
            </Space>
          </Form.Item>

          <Form.Item
            name="advance_time"
            label="预售时间"
            rules={[
              {
                required: true,
              }
            ]}
          >
            <DatePicker
              showTime

            />
          </Form.Item>
          <Form.Item
            name="putaway_time"
            label="上架时间"
            rules={[
              {
                required: true,
              }
            ]}
          >
            <DatePicker
              showTime
            />
          </Form.Item>
          <Form.Item
            name="main_goods_picture"
            label="商品主视图"
            rules={[
              {
                //required: true,
              }
            ]}
          >
            <>
              <span onClick={getUploadToken}>
                <Upload
                  action={QINIU_SERVER}
                  data={{
                    token: qiniuToken,
                    key: `picture-${Date.parse(new Date())}`,
                  }}
                  showUploadList={false}
                  listType="picture-card"
                  beforeUpload={getUploadToken}
                  onPreview={handlePreview}
                  onChange={handleChange}
                >
                  {fileList[0] ? <img
                    src={fileList[0] 
                      ? BASE_QINIU_URL + fileList[0].response.key : null}
                    alt="avatar"
                    style={{ width: '100%' }}
                  /> :  uploadButton}
                </Upload>
              </span>
            </>
           
          </Form.Item>
          <Form.Item
            name="main_goods_picture"
            label="商品轮播图"
            rules={[
              {
                //required: true,
              }
            ]}
          >
            <>
              <span onClick={getUploadToken}>
                <Upload
                  action={QINIU_SERVER}
                  data={{
                    token: qiniuToken,
                    key: `picture-${Date.parse(new Date())}`,
                  }}
                  listType="picture-card"
                  beforeUpload={getUploadToken}
                  fileList={fileListAlot}
                  onPreview={handlePreview}
                  onChange={handleChangeAlot}
                >
                  {fileListAlot.length >= 5 ? null : uploadButton}
                </Upload>
              </span>
            </>
          </Form.Item>
          <Modal
            visible={previewVisible}
            footer={null}
            onCancel={() => setPreviewVisible(!previewVisible)}
          >
            <img style={{ width: '100%' }} src={previewImage} alt="previewImg" />
          </Modal>
          <Form.Item
            name="main_goods_video"
            label="产品介绍视频"
            rules={[
              {
                //required: true,
              }
            ]}
          >
            <>
              <span onClick={getUploadToken}>
                <Upload
                  action={QINIU_SERVER}
                  data={{
                    token: qiniuToken,
                    key: `video-${Date.parse(new Date())}`,
                  }}
                  listType="picture-card"
                  beforeUpload={getUploadToken}
                  showUploadList={false}
                  onChange={handleVidoChange}
                >
                  {fileVidoList[0] ? <img 
                    src={fileVidoList[0] ? BASE_QINIU_URL + fileVidoList[0].response.key : null}
                    alt="video"
                    style={{ width: '100%' }}
                  /> :  uploadButton}
                </Upload>
              </span>
            </>
          </Form.Item>
          <Divider orientation="left">编辑商品详情</Divider>
          <Form.Item {...EditorLayout}>
            <RichTextEditor subscribeRichText={subscribeRichText} defaultText={richTextContent} />
          </Form.Item>
          <Divider orientation="left">其他属性</Divider>
          <Form.Item label=" " colon={false} className="goods-create-swtich-contianer">
            <Space size="middle">
              <span className="goods-create-swtich-item">

                <span>是否付款减库存：</span>
                <Form.Item
                  noStyle
                  name="paid_and_remove"
                  
                >
                  <Switch
                    checkedChildren="是"
                    unCheckedChildren="否"
                  />
                </Form.Item>
              </span>
              <span className="goods-create-swtich-item">
                <span>是否显示库存：</span>
                <Form.Item noStyle name="show_total">
                  <Switch
                    checkedChildren="是"
                    unCheckedChildren="否"

                  />
                </Form.Item>
              </span>
              <span className="goods-create-swtich-item">
                <span>是否支持换货：</span>
                <Form.Item noStyle name="exchange">
                  <Switch
                    checkedChildren="是"
                    unCheckedChildren="否"
                  />
                </Form.Item>
              </span>
              <span className="goods-create-swtich-item">
                <span>是否支持七天无理由退货：</span>
                <Form.Item noStyle name="sale_return">
                  <Switch
                    checkedChildren="是"
                    unCheckedChildren="否"

                  />
                </Form.Item>
              </span>
              <span className="goods-create-swtich-item">
                <span>是否预售：</span>
                <Form.Item noStyle name="advance">
                  <Switch
                    checkedChildren="是"
                    unCheckedChildren="否"

                  />
                </Form.Item>
              </span>
              <span className="goods-create-swtich-item">
                <span>是否上架：</span>
                <Form.Item noStyle name="on_sale">
                  <Switch
                    checkedChildren="是"
                    unCheckedChildren="否"

                  />
                </Form.Item>
              </span>
              <span className="goods-create-swtich-item">
                <span>是否使用优惠价：</span>
                <Form.Item noStyle name="sale">
                  <Switch
                    checkedChildren="是"
                    unCheckedChildren="否" 
                    defaultChecked
                  />
                </Form.Item>
              </span>
              <span className="goods-create-swtich-item">
                <span>是否限购：</span>
                <Form.Item noStyle name="limit">
                  <Switch checkedChildren="是" unCheckedChildren="否"  />
                </Form.Item>
              </span>
            </Space>
          </Form.Item>
         
          <FormItem {...tailLayout}>
            <Button
              type="primary"
              htmlType="submit"
            >
              下一步
            </Button>

          </FormItem>
        </Form>
      </>);
    } if (current === 1) {
      return (<>
        <div style={{ textAlign: 'center', backgroundColor: 'white' }}>
          <Divider>{(goodsModel[0] || []).title}</Divider>
          <Divider plain orientation="left">规格</Divider>
          <Select
            style={{ marginBottom: 20 }}
            onChange={selectTemplate}
            placeholder="选择规格模版"
            allowClear
          >
            {goodsModelsList.map((arr) => {
              return  <Option value={arr.id} key={arr.id}>{arr.title}</Option>;
            })}

          </Select>
          <Form
            onFinish={addSpecification}
            form={fromSpec}
          >
            <Form.List name="specification">
              {(fields) => {
                return (
                  <div style={{ textAlign: 'center', backgroundColor: 'white' }}>
                    {fields.map((field) => (
                      <>
                        <div>
                          {
            (((goodsModel[0] || []).template || []).filter((arr) => {
              return arr.use !== false;
            }) || []).map((tem) => {
              return <FormItem
                {...field}
                name={[field.name, `${tem.name}`]}
                fieldKey={[[field.fieldKey, `${tem.name}`]]}
                rules={[
                  {
                  //required: true,
                  }
                ]}
                noStyle
              >
                <Input
                  addonBefore={['', tem.name]} 
                  style={{ width: '14vw', marginBottom: 10, marginRight: 10 }}
                />
              </FormItem>;
            })
          }
                        </div>
                      </>
                    ))}
                  </div>
                
                );
              }}
            </Form.List>
            <Divider plain orientation="left" className="goods-models-normal-settings">常规设置</Divider>
            <Space size="large" style={{ marginBottom: 20 }}>
              <span>
                <span>库存: </span>
                <FormItem
                  name="total"
              //label="库存"
                  rules={[
                    {
                      required: true,
                    }
                  ]}
                  noStyle
                >
              
                  <InputNumber style={{ width: '10vw', marginBottom: 10 }} />
                </FormItem>
              </span> 
              <span>
                <span>价格: </span>
                <FormItem
                  name="price"
                  rules={[
                    {
                      required: true,
                    }
                  ]}
                  noStyle
                >
             
                  <InputNumber style={{ width: '10vw', marginBottom: 10 }} />
                </FormItem>
              </span>
              <span>
                <span>重量: </span>
                <FormItem
                  name="weight"
              
                  rules={[
                    {
                      required: true,
                    }
                  ]}
                  noStyle
                >
              
                  <InputNumber style={{ width: '10vw', marginBottom: 10 }} />
                </FormItem>
              </span>
              <span>
                <span>成本: </span>
                <FormItem
                  name="cost_price"
                  rules={[
                    {
                      required: true,
                    }
                  ]}
                  noStyle
                >
              
                  <InputNumber style={{ width: '10vw', marginBottom: 10 }} />
                </FormItem>
              </span>
              
            </Space>
            <div style={{ textAlign: 'center' }}>
              <span>是否优惠: </span>
              <Switch
                checkedChildren="是"
                unCheckedChildren="否"
                checked={checkUse} 
                onChange={() => { setCheckUse(!checkUse); }}
                style={{ marginRight: 10 }}
              />
              <span>优惠幅度: </span>
              <FormItem
                name="reduced_price"
                rules={[
                  {
                    required: true,
                  }
                ]}
                noStyle
              >
              
                <InputNumber disabled={!checkUse} style={{ width: '12vw', marginBottom: 10 }} />
              </FormItem>
              <Form.Item
                //name="main_goods_video"
                label="规格例图"
                rules={[
                  {
                    //required: true,
                  }
                ]}
                {...ModelListlayout}
              >
                <>
                  <span onClick={getUploadToken}>
                    <Upload
                      action={QINIU_SERVER}
                      data={{
                        token: qiniuToken,
                        key: `spec-${Date.parse(new Date())}`,
                      }}
                      listType="picture-card"
                      beforeUpload={getUploadToken}
                      showUploadList={false}
                      onPreview={handlePreview}
                      onChange={handleChange}
                    >
                      {fileList[0] ? <img 
                        src={BASE_QINIU_URL + fileList[0].response.key}
                        alt="pictures"
                        style={{ width: '100%' }}
                      /> :  uploadButton}
                    </Upload>
                  </span>
                  <Modal
                    visible={previewVisible}
                    footer={null}
                    onCancel={() => setPreviewVisible(!previewVisible)}
                  >
                    <img style={{ width: '100%' }} src={previewImage} alt="previewImg" />
                  </Modal>
                </>
              </Form.Item>
            </div>
          
            <Divider />
           
            <Button style={{ marginBottom: 10 }} htmlType="submit">添加</Button>
          </Form>
          <Divider>规格列表</Divider>
          <Table
            columns={goodsColumns}
            dataSource={goodsDetails}
            style={{ paddingLeft: 20, paddingRight: 20 }}
          />
       
        </div>
        <div style={{ textAlign: 'center', marginTop: 10 }}>
          <Button onClick={submitSpc} type="primary">提交</Button>
        </div>
      </>
      );
    }
    if (current === 2) {
      return (
        <Result
          icon={<SmileOutlined />}
          title="成功创建商品信息"
          extra={<Button type="primary" onClick={() => setCurrent(0)}>返回创建首页</Button>}
        />
      );
    }
  })()
}
      </div>

    </>
  );
};
GoodsAddEditor.propTypes = {
  dispatch: PropTypes.func.isRequired,
  goodId: PropTypes.number,
  goodsArea: PropTypes.arrayOf({}),
  goodsSale: PropTypes.arrayOf({}),
  goodsClassFather: PropTypes.arrayOf({}),
  goodsClassChild: PropTypes.arrayOf({}),
  goodsModelsList: PropTypes.arrayOf({}),
};
GoodsAddEditor.defaultProps = {
  goodId: 0,
  goodsArea: [],
  goodsSale: [],
  goodsClassFather: [],
  goodsClassChild: [],
  goodsModelsList: [],

};

export default connect(({
  goodsArea, goodsSale, goodsClass,
  goodsModels, CreateGoods,
}) => ({
  goodsModels,
  goodsSale: get(goodsSale, 'tags', []),
  goodsArea: get(goodsArea, 'info', []),
  goodsClassFather: get(goodsClass, 'tags', [])
    .filter((arr) => { return arr.parent_id === 0; }),
  goodsClassChild: get(goodsClass, 'tags', [])
    .filter((arr) => { return arr.parent_id !== 0; }),
  goodsModelsList: get(goodsModels, 'infos', ''),
  goodsModel: get(goodsModels, 'info', {}),
  goodId: CreateGoods.goodId,
  GoodsAreaTags: goodsArea.GoodsAreaTags,

}))(GoodsAddEditor);
