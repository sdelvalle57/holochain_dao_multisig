import React, { Fragment } from 'react';
import { Router } from '@reach/router';
import { RouteComponentProps } from '@reach/router';

import { PageContainer, Dashboard } from '../components';

interface DashboardProps extends RouteComponentProps {
 
}

const Pages: React.FC<DashboardProps> = () => {
  return (
    <Fragment>
      <PageContainer>
        <Router primary={false} component={Fragment}>
          <Dashboard path='/' />
        </Router>
      </PageContainer>
    </Fragment>
  );
}



export default Pages;