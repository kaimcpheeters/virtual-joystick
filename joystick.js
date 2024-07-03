let JOYSTICK_DIV = null;

function __init_joystick_div() {
    JOYSTICK_DIV = document.createElement('div');
    const div_style = JOYSTICK_DIV.style;
    div_style.background = 'rgba(255,255,255,0)';
    div_style.position = 'absolute';
    div_style.top = '0px';
    div_style.bottom = '0px';
    div_style.left = '0px';
    div_style.right = '0px';
    div_style.margin = '0px';
    div_style.padding = '0px';
    div_style.borderWidth = '0px';
    div_style.overflow = 'hidden';
    div_style.zIndex = '10000';
    document.body.appendChild(JOYSTICK_DIV);
}

class JoyStick {
    constructor(attrs) {
        this.radius = attrs.radius || 50;
        this.inner_radius = attrs.inner_radius || this.radius / 2;
        this.x = attrs.x || 0;
        this.y = attrs.y || 0;
        this.mouse_support = attrs.mouse_support || true;
        this.left = false;
        this.right = false;
        this.up = false;
        this.down = false;

        if (attrs.visible === undefined) {
            attrs.visible = true;
        }

        if (attrs.visible) {
            this.__create_fullscreen_div();
        }
    }

    __is_up(dx, dy) {
        if (dy >= 0) return false;
        if (Math.abs(dx) > 2 * Math.abs(dy)) return false;
        return true;
    }

    __is_down(dx, dy) {
        if (dy <= 0) return false;
        if (Math.abs(dx) > 2 * Math.abs(dy)) return false;
        return true;
    }

    __is_left(dx, dy) {
        if (dx >= 0) return false;
        if (Math.abs(dy) > 2 * Math.abs(dx)) return false;
        return true;
    }

    __is_right(dx, dy) {
        if (dx <= 0) return false;
        if (Math.abs(dy) > 2 * Math.abs(dx)) return false;
        return true;
    }

    __create_fullscreen_div() {
        if (JOYSTICK_DIV === null) {
            __init_joystick_div();
        }
        this.div = JOYSTICK_DIV;

        this.base = document.createElement('span');
        let div_style = this.base.style;
        div_style.width = this.radius * 2 + 'px';
        div_style.height = this.radius * 2 + 'px';
        div_style.position = 'absolute';
        div_style.top = this.y - this.radius + 'px';
        div_style.left = this.x - this.radius + 'px';
        div_style.borderRadius = '50%';
        div_style.borderColor = 'rgba(200,200,200,0.5)';
        div_style.borderWidth = '1px';
        div_style.borderStyle = 'solid';
        this.div.appendChild(this.base);

        this.control = document.createElement('span');
        div_style = this.control.style;
        div_style.width = this.inner_radius * 2 + 'px';
        div_style.height = this.inner_radius * 2 + 'px';
        div_style.position = 'absolute';
        div_style.top = this.y - this.inner_radius + 'px';
        div_style.left = this.x - this.inner_radius + 'px';
        div_style.borderRadius = '50%';
        div_style.backgroundColor = 'rgba(200,200,200,0.3)';
        div_style.borderWidth = '1px';
        div_style.borderColor = 'rgba(200,200,200,0.8)';
        div_style.borderStyle = 'solid';
        this.div.appendChild(this.control);

        this.__setupEventListeners();
    }

    __setupEventListeners() {
        const touch_handler = (evt) => {
            const touch_obj = evt.changedTouches ? evt.changedTouches[0] : evt;
            if (this.mouse_support && !(touch_obj.buttons === 1)) {
                return;
            }
            this.control.style.left = touch_obj.clientX - this.inner_radius + 'px';
            this.control.style.top = touch_obj.clientY - this.inner_radius + 'px';

            const dx = touch_obj.clientX - this.x;
            const dy = touch_obj.clientY - this.y;
            this.up = this.__is_up(dx, dy);
            this.down = this.__is_down(dx, dy);
            this.left = this.__is_left(dx, dy);
            this.right = this.__is_right(dx, dy);
        };

        const clear_flags = () => {
            this.left = false;
            this.right = false;
            this.up = false;
            this.down = false;

            this.control.style.top = this.y - this.inner_radius + 'px';
            this.control.style.left = this.x - this.inner_radius + 'px';
        };

        this.bind('touchmove', touch_handler);
        this.bind('touchstart', touch_handler);
        this.bind('touchend', clear_flags);
        if (this.mouse_support) {
            this.bind('mousedown', touch_handler);
            this.bind('mousemove', touch_handler);
            this.bind('mouseup', clear_flags);
        }
    }

    bind(evt, func) {
        this.base.addEventListener(evt, func);
        this.control.addEventListener(evt, func);
    }
}

class JoyStickButton {
    constructor(attrs) {
        this.radius = attrs.radius || 50;
        this.x = attrs.x || 0;
        this.y = attrs.y || 0;
        this.text = attrs.text || '';
        this.mouse_support = attrs.mouse_support || false;
        if (JOYSTICK_DIV === null) {
            __init_joystick_div();
        }
        this.__createButton();
        this.__setupEventListeners(attrs.func);
    }

    __createButton() {
        this.base = document.createElement('span');
        this.base.innerHTML = this.text;
        const div_style = this.base.style;
        div_style.width = this.radius * 2 + 'px';
        div_style.height = this.radius * 2 + 'px';
        div_style.position = 'absolute';
        div_style.top = this.y - this.radius + 'px';
        div_style.left = this.x - this.radius + 'px';
        div_style.borderRadius = '50%';
        div_style.backgroundColor = 'rgba(255,255,255,0.1)';
        div_style.borderWidth = '1px';
        div_style.borderColor = 'rgba(255,255,255,0.8)';
        div_style.borderStyle = 'solid';
        JOYSTICK_DIV.appendChild(this.base);
    }

    __setupEventListeners(func) {
        if (func) {
            if (this.mouse_support) {
                this.bind('mousedown', func);
            }
            this.bind('touchstart', func);
        }

        const __over = () => {
            this.base.style.backgroundColor = 'rgba(255,255,255,0.3)';
        };
        const __leave = () => {
            this.base.style.backgroundColor = 'rgba(255,255,255,0.1)';
        };

        this.bind('touchstart', __over);
        this.bind('touchend', __leave);
        if (this.mouse_support) {
            this.bind('mousedown', __over);
            this.bind('mouseup', __leave);
        }
    }

    bind(evt, func) {
        this.base.addEventListener(evt, func);
    }
}

export { JoyStick, JoyStickButton };

