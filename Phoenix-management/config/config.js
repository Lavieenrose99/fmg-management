// https://umijs.org/config/
import { defineConfig } from 'umi';
import defaultSettings from './defaultSettings';
import proxy from './proxy';

const { REACT_APP_ENV } = process.env;
export default defineConfig({
  hash: true,
  antd: {},
  dva: {
    hmr: true,
  },
  locale: {
    default: 'zh-CN',
    antd: true,
    //baseNavigator: true,
  },
  // dynamicImport: {
  //   loading: '@/components/PageLoading/index',
  // },
  targets: {
    ie: 11,
  },
  routes: [
    // {
    //   path: '/user',
    //   component: '../layouts/UserLayout',
    //   routes: [
    //     {
    //       name: 'login',
    //       path: '/user/login',
    //       component: './user/login',
    //     }
    //   ],
    // },
    {
      path: '/',
      //component: '../layouts/SecurityLayout',
      routes: [
        {
          path: '/',
          component: '../layouts/BasicLayout',
          //authority: ['admin', 'user'],
          routes: [
            {
              path: '/',
              redirect: '/goods/goods-list',
            },
            {
              path: '/settings_controls',
              name: '管理页',
              icon: 'crown',
              //authority: ['admin'],
              routes: [
                {
                  path: '/settings_controls/goods-class-tags-management',
                  name: '类别管理',
                  icon: 'setting',
                  component: './GoodsManagement/GoodsTags/GoodsClassIndex',
                  //authority: ['admin'],
                },
                {
                  path: '/settings_controls/goods-tags-management',
                  name: '标签管理',
                  icon: 'setting',
                  component: './GoodsManagement/GoodsTags/GoodsTagsIndex',
                },
                {
                  path: '/settings_controls/rolling_picture_index',
                  name: '轮播图管理',
                  icon: 'smile',
                  component: './settings_controls/rolling_picture_index',
                  //authority: ['admin'],
                },
                {
                  path: '/settings_controls/icon_setting',
                  name: '图标管理',
                  icon: 'smile',
                  component: './settings_controls/icon_setting',
                },
             
              ],
            },
            {
              path: '/goods',
              name: '商品管理',
              icon: 'setting',
              //authority: ['admin'],
              routes: [
                {
                  path: '/goods/goods-list',
                  name: '商品列表',
                  icon: 'smile',
                  component: './GoodsManagement/GoodsListTable',
                  //authority: ['admin'],
                },
                {
                  path: '/goods/add-goods',
                  name: '添加商品',
                  icon: 'add',
                  component: './GoodsManagement/GoodsAddEditor',
                  // authority: ['admin'],
                },
               
                {
                  path: '/goods/goods-models-management',
                  name: '商品模版',
                  icon: 'setting',
                  component: './GoodsManagement/GoodsModels/GoodsModelsList',
                  // authority: ['admin'],
                }
              ],
            },
            {
              path: '/goodspayment',
              name: '订单管理',
              icon: 'setting',
              //authority: ['admin'],
              routes: [
                {
                  path: '/goodspayment/list',
                  name: '订单列表',
                  icon: 'smile',
                  component: './Bill/bills_list',
                  //authority: ['admin'],
                },
                {
                  path: '/goodspayment/express_list',
                  name: '快递查询',
                  icon: 'smile',
                  component: './Bill/express_list',
                  //authority: ['admin'],
                },
                {
                  path: '/goodspayment/test_list',
                  name: '测试表格',
                  icon: 'smile',
                  component: './Bill/test_list',
                  //authority: ['admin'],
                }
              ],
            },
            // {
            //   name: 'list.table-list',
            //   icon: 'table',
            //   path: '/list',
            //   component: './ListTableList',
            // },
            {
              component: './404',
            }
          ],
        },
        {
          component: './404',
        }
      ],
    },
    {
      component: './404',
    }
  ],
  // Theme for antd: https://ant.design/docs/react/customize-theme-cn
  theme: {
    // ...darkTheme,
    'primary-color': defaultSettings.primaryColor,
  },
  // @ts-ignore
  title: false,
  ignoreMomentLocale: true,
  proxy: proxy[REACT_APP_ENV || 'dev'],
  manifest: {
    basePath: '/',
  },
});
