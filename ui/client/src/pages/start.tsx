import React, { Fragment } from 'react';
import { Router } from '@reach/router';
import { RouteComponentProps } from '@reach/router';

import { PageContainer } from '../components';
import Start from '../components/start'

interface StartProps extends RouteComponentProps {
 
}

const Pages: React.FC<StartProps> = () => {
  return (
    <Fragment>
      <PageContainer>
        <Router primary={false} component={Fragment}>
          <Start path='/' />
        </Router>
      </PageContainer>
    </Fragment>
  );
}



export default Pages;
