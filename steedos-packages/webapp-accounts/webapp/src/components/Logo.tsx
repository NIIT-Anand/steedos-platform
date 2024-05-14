/*
 * @Author: Anand Pilania Anand.Pilania@niit.com
 * @Date: 2024-05-14 04:09:47
 * @LastEditors: Anand Pilania Anand.Pilania@niit.com
 * @LastEditTime: 2024-05-14 04:29:32
 * @FilePath: /steedos-platform/steedos-packages/webapp-accounts/webapp/src/components/Logo.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import * as React from 'react';
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { getSettings, getTenant } from '../selectors';
import { Client4 } from '../client';
import { localizeMessage } from '../utils/utils';

interface Props {
  logoUrl?: string;
}

const Logo = ({ tenant, location }: any) => {
  let logoUrl = `${Client4.getUrl()}${localizeMessage('accounts.logoURL')}`;
  if (tenant.logo_url) {
    logoUrl = tenant.logo_url
  }
  return (<div>
    <img src={logoUrl} className='logo-class h-10'></img>
    </div>
  )
};

function mapStateToProps(state: any) {
  return {
      tenant: getTenant(state),
  };
}

export default connect(mapStateToProps)(Logo);
