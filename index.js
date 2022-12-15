import { render, Component, createElement, Fragment } from './src/index';

(function()
{
    class Nest2 extends Component
    {
        constructor(props)
        {
            super(props);

            console.log('Constructing Nest2');
        }

        render()
        {
            return `
                <span>
                    Nest2
                </span>
            `;
        }
    }

    class Nest1 extends Component
    {
        Nest2 = Nest2;

        constructor(props)
        {
            super(props);

            console.log('Constructing Nest1');
        }

        render()
        {
            return `
                <div>
                    Nest 1
                    {this.props.testprop}
                </div>
            `;
        }
    }

    class Bar extends Component
    {
        constructor(props)
        {
            super(props);

            this.interpolate = 'interpolated from bar!';
            this.evaluate    = this.exampleMethod;
            this.nested      = 'Nested from Bar!';
            this.Nest1       = Nest1;

            console.log('Constructing Bar');
        }

        exampleMethod()
        {
            return 'Evaluated from bar!'
        }
        
        render()
        {
            console.log('rending Bar');

            return `
                <div>
                    Bar
                    <Nest1 testprop={this.props.testprop} />
                </div>
            `;
        }
    }

    class FragmentNest2 extends Component
    {
        Fragment = Fragment;

        render()
        {
            if (this.props.testprop > 1)
            {
                return `
                    <Fragment>
                        <div>FragmentNest2 (1)</div>
                        <div>FragmentNest2 (2)</div>
                        <div>FragmentNest2 (3)</div>
                    </Fragment>
                `;

            }

            return `
                <Fragment>
                    <div>FragmentNest2 (1)</div>
                    <div>FragmentNest2 (2)</div>
                </Fragment>
            `;
        }
    }

    class FragmentNest1 extends Component
    {
        FragmentNest2 = FragmentNest2;
        Fragment = Fragment;
        
        render()
        {
            return `
                <Fragment>
                    <FragmentNest2 testprop={this.props.testprop} />
                </Fragment>
            `;
        }
    }

    class ThunkNest2 extends Component
    {        
        render()
        {
            return `<div>ThunkNest2</div>`;
        }
    }

    class ThunkNest1 extends Component
    {
        ThunkNest2 = ThunkNest2;
        
        render()
        {
            return `
                <ThunkNest2 />
            `;
        }
    }

    class Foo extends Component
    {
        constructor(props)
        {
            super(props);

            this.state = {counter : 1, foo: 'bar', bar: {foo: 'bar'}};

            this.interpolate = 'interpolated!';
            this.evaluate    = this.returnJsx;
            this.Bar         = Bar;
            this.numbers     = [1, 2, 3, 4, 5];
            this.nested      = 'Nested from Foo!';
            this.ThunkNest1  = ThunkNest1;
            this.Nest1       = Nest1;
            this.Nest2       = Nest2;
            this.variable    = 'interpolated variable';
            this.FragmentNest1 = FragmentNest1;
            this.Fragment     = Fragment;
            this.foo = null;
            this.styles1      = {
                color: 'white',
                backgroundColor: 'red'
            };
            this.styles2 = 'color:white;backgroundColor:purple';
            this.styles3      = {
                color: 'black',
                backgroundColor: 'yellow',
                border: '1px solid black'
            };

            var _this = this;

            console.log('Constructing Foo')

            setInterval(function()
            {
                _this.tick();

            }, 1000);
        }

        tick()
        {
            if (this.state.counter === 2)
            {
                return;
            }

            console.log('STATE CHANGE');
            console.log('\n\n');

            this.setState('counter', this.state.counter + 1);
        }

        exampleMethod()
        {
            return 'Evaluated!'
        }

        returnJsx()
        {
            return this.jsx('<div><h1>Returned JSX! with <i>{variable}</i></h1></div>');
        }

        handler()
        {
            alert('clicked!');
        }

        render()
        {
            /* if (this.state.counter === 2)
            {
               return `
                 <div>
                    <section>1</section>
                    <section>2</section>
                </div>
                `;
            }

            return `
                <div>
                    <section>1</section>
                </div>
            `;*/

           
            return `
                <div>
                    <FragmentNest1 testprop={this.state.counter} />
                </div>
            `;

            if (this.state.counter === 2)
            {
               return `
                     <div>
                        <div>1</div>
                        <FragmentNest1 />
                        <div key="native">keyed native</div>
                        <div>2</div>
                    </div>
                `;
            }

            return `
                <div>
                    <div>1</div>
                    <div>2</div>
                    <FragmentNest1 />
                    <div key="native">keyed native</div>
                </div>
            `;

           /* if (this.state.counter === 2)
            {
                return `
                    <ul>
                        
                    </ul>
                `
            }

            return `
                <ul>
                    <li>li 1</li>
                    <li>li 2</li>
                </ul>
            `;
*/

            if (this.state.counter === 2)
            {
                return `
                   <section>
                        <div checked="true" disabled={false}>1.div</div>
                        <Bar key="test" testprop={this.state.counter} otherprop="foobar" />
                        <i>foo</i>
                        <i>foo</i>
                        <i>foo</i>
                        <span key="span">4.span</span>
                        <div onClick={this.handler}>3. div</div>
                        <i>foo</i>
                        <i>foo</i>
                        <i>foo</i>
                        <section style={this.styles1}>section</section>
                    </section>
                `;

            }

         return `
            <section>
                <div onClick={this.handler} style={this.styles1}>1.div</div>
                <i>2.i</i>
                <div style={this.styles2}>3. div</div>
                <span key="span">4.span</span>
                <Bar key="test" testprop={this.state.counter} otherprop="foobar" />
            </section>
            `;
            
        }
    }

    const initialProps =
    {
        string: "foo", 
        number: 5,
        boolean: true
    };


    const TestFunc = (props) =>
    {
        console.log(this);

        let name = 'test';

        return `<div>hello world{this.name}</div>`;
    };

    render(Foo, document.getElementById('app'));


})();