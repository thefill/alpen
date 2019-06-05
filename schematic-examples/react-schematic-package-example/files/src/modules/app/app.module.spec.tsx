import {configure, shallow} from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';
import * as React from 'react';
import {AppModule} from './app.module';

configure({adapter: new Adapter()});

describe('<AppModule/>', () => {

    it('renders without crashing', () => {
        const wrapper = shallow(<AppModule/>);
        expect(wrapper.exists()).toBeTruthy();
    });

    it('renders header', () => {
        const wrapper = shallow(<AppModule/>);
        expect(wrapper.find('h1')).toHaveLength(1);
    });
    //
    // it('renders an `.icon-star`', () => {
    //     const wrapper = shallow(<MyComponent />);
    //     expect(wrapper.find('.icon-star')).to.have.lengthOf(1);
    // });
    //
    // it('renders children when passed in', () => {
    //     const wrapper = shallow((
    //         <MyComponent>
    //             <div className="unique" />
    //         </MyComponent>
    //     ));
    //     expect(wrapper.contains(<div className="unique" />)).to.equal(true);
    // });
    //
    // it('simulates click events', () => {
    //     const onButtonClick = sinon.spy();
    //     const wrapper = shallow(<Foo onButtonClick={onButtonClick} />);
    //     wrapper.find('button').simulate('click');
    //     expect(onButtonClick).to.have.property('callCount', 1);
    // });
});
