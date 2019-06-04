import {configure, shallow} from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';
import * as React from 'react';
import {PageAModule} from './page-a.module';

configure({adapter: new Adapter()});

describe('<PageAModule />', () => {
    it('renders without crashing', () => {
        const wrapper = shallow(<PageAModule/>);
        expect(wrapper.exists()).toBeTruthy();
    });
});
