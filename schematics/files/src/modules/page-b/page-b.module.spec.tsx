import {configure, shallow} from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';
import * as React from 'react';
import {PageBModule} from './page-b.module';

configure({adapter: new Adapter()});

describe('<PageBModule />', () => {
    it('renders without crashing', () => {
        const wrapper = shallow(<PageBModule/>);
        expect(wrapper.exists()).toBeTruthy();
    });
});
