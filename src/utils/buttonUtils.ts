
import { upperFirst } from 'lodash';

export const logButtonClick = () => {
  const message = upperFirst('button clicked');
  console.log(message);
};
