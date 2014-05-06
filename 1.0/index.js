/**
 * @fileoverview 
 * @author 秋知<benfchen.cf@alibaba-inc.com>
 * @module imagesLoaded
 **/
KISSY.add(function (S, Node,Base,Event) {
    var EMPTY = '';
    var $ = Node.all;
    /**
     * 
     * @class ImagesLoaded
     * @constructor
     * @extends Base
     */
    function ImagesLoaded(comConfig) {
        var self = this;

        if(!(self instanceof ImagesLoaded)){
            return new ImagesLoaded(comConfig);
        }
        //调用父类构造函数
        ImagesLoaded.superclass.constructor.call(self, comConfig);

        var elem = comConfig.elem,
            options = comConfig.options,
            onAlways = comConfig.onAlways;

        if(typeof elem === 'string'){
            elem = $(elem);
        }
        this.elements = _getElementsAsArray(elem);  //原生Element DOM数组
        if(typeof options === 'function'){
            onAlways = options;
        }else{
            this.options = options;
        }
        if(onAlways){
            this.on('always',onAlways);
        }

        this._getImages();

        setTimeout(function(){
            self._check();
        });

    }

    //使得ImagesLoaded拥有处理事件的功能
    S.augment(ImagesLoaded, Event.Target);

    S.extend(ImagesLoaded, Base, /** @lends ImagesLoaded.prototype*/{
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
            var loadingImage = new LoadingImage(img);
            this.images.push(loadingImage);
        },
        _check : function(){
            var self = this;

            var checkedCount = 0;
            var length = self.images.length;
            self.hasAnyBroken = false;
            //如果没有图片元素则直接跳到已完成状态
            if(!length){
                self._complete();
                return;
            }
            for(var j = 0; j < length; j++){
                var loadingImage = self.images[j];
                loadingImage.on('confirm',onConfirm);
                loadingImage._check();
            }

            function onConfirm( image, eventData ) {
              if ( _this.options.debug && hasConsole ) {
                console.log( 'confirm', eventData.image, eventData.message );
              }

              _this._progress( eventData.image );
              checkedCount++;
              if ( checkedCount === length ) {
                _this._complete();
              }
              return true; // bind once
            }
        },
        _progress : function(image){

        },
        _complete : function(){
            
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
        _comfirm : function(isLoaded, obj){
            var self = this;
            this.isLoaded = obj.isLoaded;
            this.fire('comfirm',{
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



