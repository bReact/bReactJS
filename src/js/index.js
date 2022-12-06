import { render, Component, createElement, Fragment } from './dom';

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

    class FragmentTest extends Component
    {
        constructor(props)
        {
            super(props);

            this.Fragment = Fragment;

            console.log('Constructing FragmentTest');
        }
        
        render()
        {
            console.log('rending FragmentTest');

            return ``;
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
            this.Nest1       = Nest1;
            this.Nest2       = Nest2;
            this.variable    = 'interpolated variable';
            this.FragmentTest = FragmentTest;
            this.Fragment     = Fragment;
            this.foo = null;

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
            console.log('rending Foo');

            if (this.state.counter === 2)
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

            

            if (this.state.counter === 2)
            {
                return `
                   <section>
                        <div>1.div</div>
                        <i>2.i</i>
                        <Bar key="test" testprop={this.state.counter} />
                        <div>3. div</div>
                        <span key="span">4.span</span>
                    </section>
                `;

            }

         return `
               <section>
                    <Bar key="test" testprop={this.state.counter}  />
                    <span key="span" className="foobar">2. span</span>
                    <div>3.div</div>
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

    render(Foo, document.getElementById('app'));


})();