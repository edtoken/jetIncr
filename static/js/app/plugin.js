define([
    'jquery'
], function ($) {

    var Pl = {};

    /**
     * plugin methods private
     * @type {{}}
     */

    Pl.fn = {};

    Pl.fn.createUniqueId = function(prefix){

        if(!prefix){
            prefix = '';
        }

        var num = 0;

        var makeId = function(id){

            var nodeId = id + '-' + num.toString();
            var node = document.getElementById(nodeId);
            while(node){
                num++;
                return makeId(id);
            }

            return nodeId;

        };

        return makeId('gi-' + prefix);
    };

    Pl.fn.createWrapNode = function(){

        var id = this.createUniqueId('wrap');
        var node = document.createElement('div');
        node.id = id;

        /**
         * styles wrap
         */

        node.setAttribute('style', '' +
            'position:fixed;left:0;top:0;width:0;height:0;' +
            'z-index:100500;border:1px solid red;'
        );

        $node = $(node);
        return $node;

    };

    Pl.fn.createCanvasNode = function(){

    };

    Pl.fn.createCanvasNode = function(){

        if("getContext" in document.createElement("canvas") === false){
            return false;
        }

        var canvas = document.createElement('canvas');
        return canvas;
    };

    Pl.fn.getCanvasCtx = function(){
        return this.nodes.canvas.getContext('2d');
    };


    /**
     * initialize method
     * @param el initialize node
     * @param options plugin options
     */
    Pl.fn.initialize = function(el, options){

        var self = this;

        this.nodes = {};
        this.nodes.$el = el;

        this.options = $.extend(true, {
            debug:false,
            zoom:1,
            wrap:{
                width:150,
                height:50
            }
        }, options);

        this.nodes.$wrap = this.createWrapNode();

        $('body').append(this.nodes.$wrap);

        this.nodes.canvas = this.createCanvasNode();


        if(!this.nodes.canvas){
            alert('plugin GetIncr not workin');
            return false;
        }

        this.nodes.$wrap.append(this.nodes.canvas);


        this.canvas = {};
        this.canvas.activeImage = {
            src:''
        };
        this.canvas.images = {};

        this.canvas.options = {};
        this.canvas.ctx = this.getCanvasCtx();


        /**
         * create mouse events
         */
        $(this.nodes.$el).on('mousemove', function(e){

            self.fn.show();

            /**
             * need render coordinats and image
             */

            /**
             * get mouse coordinats
             */
            e = e || window.event;

            if (e.pageX == null && e.clientX != null ) {
                var html = document.documentElement;
                var body = document.body;
                e.pageX = e.clientX + (html && html.scrollLeft || body && body.scrollLeft || 0) - (html.clientLeft || 0);
                e.pageY = e.clientY + (html && html.scrollTop || body && body.scrollTop || 0) - (html.clientTop || 0);
            }

            var data = {};
            data.x = e.pageX;
            data.y = e.pageY;

            data.activeImage = e.target.getAttribute('src');
            data.target = e.target;

            self.fn.render(data);

        });

        $(this.nodes.$el).on('mouseleave', function(e){
            self.fn.hide();
        });


        if(this.options.debug){
            console.log('JetIncr initialize ready', this);
        }

        return this.fn;

    };

    /**
     * plugin methods public
     * @type {{}}
     * @private
     */
    Pl.fn.fn = {};

    /**
     * public method get init node
     */
    Pl.fn.fn.getEl = function(){
        return Pl.$el;
    };

    Pl.fn.fn.getWrap = function(){
        return Pl.fn.nodes.$wrap;
    };

    Pl.fn.fn.getCanvas = function(){
        return Pl.fn.nodes.canvas;
    };

    Pl.fn.fn.getCanvasCtx = function(){
        return Pl.fn.canvas.ctx;
    };

    Pl.fn.fn.getCanvasOption = function(){
        return Pl.fn.canvas;
    };

    Pl.fn.fn.getOption = function(){
        return Pl.fn.options;
    };


    Pl.fn.fn.render = function(data){

        var options = this.getOption();
        var canvasOpt = this.getCanvasOption();


        var wrapData = $.extend(true, options.wrap, {
            left:data.x - options.wrap.width - 50,
            top:data.y - 50 - $(window).scrollTop()
        });

        var wrap = this.getWrap();
        var canvas = this.getCanvas();
        var ctx = this.getCanvasCtx();

        wrap.css(wrapData);
        canvas.width = wrapData.width;
        canvas.height = wrapData.height;

        var drawImage = function(img, data){

            /**
             * draw image on the canvas
             */

            /**
             * get target coordinats
             */

            var targetCoordinates = {};
            var $target = $(data.target);
            targetCoordinates.width = $target.width();
            targetCoordinates.height = $target.height();
            targetCoordinates.offset = $target.offset();

            var imgData = {};
            imgData.width = img.width;
            imgData.height = img.height;

            var mouseCoordinat = {};
            mouseCoordinat.left = data.x - targetCoordinates.offset.left;
            mouseCoordinat.top = data.y - targetCoordinates.offset.top;

            /**
             * корректируем координаты отрисованной части
             * свойство пропорции :D + маштаб
             */

            var renderCoordinat = {};
            renderCoordinat.left = Math.ceil(mouseCoordinat.left *  (imgData.width / targetCoordinates.width));
            renderCoordinat.top = Math.ceil(mouseCoordinat.top *  (imgData.height / targetCoordinates.height));

            renderCoordinat.left = renderCoordinat.left - wrapData.width / 2;
            renderCoordinat.top = renderCoordinat.top - wrapData.height / 2;


            if(renderCoordinat.left < 0){
                renderCoordinat.left = 0;
            }

            if(renderCoordinat.left + wrapData.width > imgData.width){
                renderCoordinat.left = imgData.width - wrapData.width;
            }

            if(renderCoordinat.top + wrapData.height > imgData.height){
                renderCoordinat.top = imgData.height - wrapData.height;
            }

            //if(renderCoordinat.left + wrapData.width / 2 > imgData.width){
            //    renderCoordinat.left = imgData.width - wrapData.width / 2;
            //}

            if(renderCoordinat.top < 0){
                renderCoordinat.top = 0;
            }

            ctx.drawImage(img,renderCoordinat.left,renderCoordinat.top,imgData.width,imgData.height,0,0,imgData.width,imgData.height);
        };


        var imageObj = canvasOpt.images[data.activeImage];

        if(!imageObj || !imageObj.img){

            var img = new Image();

            img.onload = function(){
                /**
                 * image load ready draw image
                 */

                drawImage(this, data);
                /**
                 * todo maybe hover other image - have error
                 */
                canvasOpt.images[data.activeImage] = {img:this, target:data.target};

            };

            img.onerror = function(){
                /**
                 * canvas image cat not load render error
                 */
            };

            img.src = data.activeImage;

        }else{
            data.target = imageObj.target;
            drawImage(imageObj.img, data);
        }
    };

    Pl.fn.fn.show = function(){
        var wrap = this.getWrap();
        if(wrap.is(':visible')){
            return true;
        }
        wrap.show();
    };

    Pl.fn.fn.hide = function(){
        var wrap = this.getWrap();
        if(wrap.is(':visible')){
            wrap.hide();
        }
        return true;
    };

    var GetIncr = function(options){
        return Pl.fn.initialize(this, options);
    };

    GetIncr.prototype = Pl.fn;

    $.fn.getIncr = GetIncr;
});

