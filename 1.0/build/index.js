/*
combined files : 

gallery/imagesLoaded/1.0/index

*/
/**
 * @fileoverview 
 * @author 秋知<benfchen.cf@alibaba-inc.com>
 * @module imagesLoaded
 **/
KISSY.add('gallery/imagesLoaded/1.0/index',function (S, Node,Base,Event) {
    var EMPTY = '';
    var $ = Node.all;
    /**
     * 
     * @class ImagesLoaded
     * @constructor
     * @extends Base
     * @uses Event.Target
     * @param comConfig {Object}
     * @param comConfig.elem {String|HTMLElement|Node} 要监听图片下载进度的元素
     * @param [comConfig.options] {Object|Function} 当为Function时，则是图片列表完成时（无论失败或成功）的回调
     * @param [comConfig.complete] {Function} 图片列表完成时（无论失败或成功）的回调
     */
    function ImagesLoaded(comConfig) {
        var self = this;

        if(!(self instanceof ImagesLoaded)){
            return new ImagesLoaded(comConfig);
        }
        //调用父类构造函数
        ImagesLoaded.superclass.constructor.call(self, comConfig);
        this._init(comConfig);
    }

    //使得ImagesLoaded拥有处理事件的功能
    S.augment(ImagesLoaded, Event.Target);

    S.extend(ImagesLoaded, Base, /** @lends ImagesLoaded.prototype*/{
    /**
     * 初始化函数
     * @method _init
     * @param comConfig {Object}
     * @param comConfig.elem {String|HTMLElement|Node} 要监听图片下载进度的元素
     * @param [comConfig.options] {Object|Function} 当为Function时，则是图片列表完成时（无论失败或成功）的回调
     * @param [comConfig.complete] {Function} 图片列表完成时（无论失败或成功）的回调
     */
        _init : function(comConfig){
            var self = this;
            var elem = comConfig.elem,
                options = comConfig.options,
                complete = comConfig.complete;
            self.checkedCount = 0;
            self.imagesCount = 0;
            self.hasAnyBroken = false;
            self.isComplete = false;
            if(typeof elem === 'string'){
                elem = $(elem);
            }
            self.elements = self._getElementsAsArray(elem);  //原生Element DOM数组
            if(typeof options === 'function'){
                complete = options;
            }else{
                self.options = options;
            }
            if(complete){
                self.on('complete',complete);
            }

            self._getImages();
            self._check();
        },
    /**
        将元素转成数组
        @method _getElementsAsArray
        @param obj {Object|Array} 需要转化的元素
    */
        _getElementsAsArray : function(obj){
            var elementsArr = [];
            if(S.isArray(obj)){
                elementsArr = obj;
            }else if(typeof obj.length === 'number'){
                for(var i = 0; i < obj.length; i++){
                    elementsArr.push(obj[i]);
                }
            }else{
                elementsArr.push(obj);
            }
            return elementsArr;
        },
    /**
        获取图片对象，初始化成员属性this.images {Array}。
        @method _getImages
        @exmaple
        this.images如： [loadingImage1,loadingImage2...]
    */
        _getImages : function(){
            this.images = [];
            for(var i = 0; i < this.elements.length; i++){
                var elem = this.elements[i];
                if(elem.nodeName === 'IMG' ){
                    this._addImage(elem);
                }
                var nodeType = elem.nodeType;
                if(!nodeType || !( nodeType === 1 || nodeType === 9 || nodeType === 11 )){
                    continue;
                }
                var childElems = $(elem).all('img');
                for(var j = 0; j < childElems.length; j++){
                    this._addImage(childElems[j]);
                }
            }
        },
        _addImage : function(img){
            this.imagesCount++;
            var loadingImage = new LoadingImage(img);
            this.images.push(loadingImage);
        },
        /**
            检查图片列表状态并对图片列表中的每个图片进行事件绑定
            @method _check
        */
        _check : function(){
            var self = this;

            //如果没有图片元素则直接跳到已完成状态
            if(!self.imagesCount){
                self._complete();
                return;
            }
            for(var j = 0; j < self.imagesCount; j++){
                var loadingImage = self.images[j];
                loadingImage.on('confirm',onConfirm);
                loadingImage._check();
            }

            function onConfirm( eventData ) {
                self.checkedCount++;
                self._progress( eventData.image );
                if ( self.checkedCount === self.imagesCount ) {
                self._complete();
                }
                return true; // bind once
            }
        },
        /**
            当图片列表中的某一张图片下载完或确定出错后触发ImagesLoaded的progress事件，执行调用者绑定相应的事件处理函数
            @method _progress
        */
        _progress : function(image){
            this.hasAnyBroken = this.hasAnyBroken || !image.isLoaded;
            var self = this;
            self.fire('progress',image);
        },
        /**
            当图片列表中所有图片的状态都确定后，根据状态分别触发以下事件
            - fail 当图片列表中有至少一张图片是出错的
            - done 当图片列表中所有图片都成功下载
            - complete 无论成功与否都会触发此事件
        */
        _complete : function(){
            var eventName = this.hasAnyBroken ? 'fail' : 'done';
            this.isComplete = true;
            var self =this;
            self.fire(eventName, self);
            self.fire('complete',self);
        }
    }, {ATTRS : /** @lends ImagesLoaded*/{

    }});

    function LoadingImage(img){
        this.img = img;
    }
    S.augment(LoadingImage,Event.Target);
    S.extend(LoadingImage, Base,{
        _check : function(){
            var self = this;
            var resource = cache[ this.img.src ] || new Resource( this.img.src );
            if ( resource.isConfirmed ) {
              this._confirm( resource.isLoaded, 'cached was confirmed' );
              return;
            }

            resource.on('confirm',function(obj){
                self._confirm(true, obj);
            });
            resource._check();
        },
        _confirm : function(isLoaded, obj){
            var self = this;
            this.isLoaded = obj.isLoaded;
            this.fire('confirm',{
                image : this,
                message : obj.message
            });
        }
    });

    var cache = {};
    function Resource(src){
        this.src = src;
        cache[src] = this;
    }
    S.augment(Resource,Event.Target);
    S.extend(Resource, Base, {
        _check : function(){
            var self = this;
            if(this.isChecked){
                return;
            }
            var proxyImage = new Image();
            $(proxyImage).on('load',function(event){
                self._confirm(true,'onload');
            });
            $(proxyImage).on('error',function(event){
                self._confirm(false,'onerror');
            });
            proxyImage.src = self.src;
        },
        _confirm : function(isLoaded, message){
            this.isLoaded = isLoaded;
            this.isConfirmed = true;
            this.fire('confirm',{
                isLoaded : isLoaded,
                message : message
            });
        }
    });

    return ImagesLoaded;
}, {requires:['node', 'base', 'event']});




