## 综述

ImagesLoaded是一个能监听图片列表加载进度的组件。ImagesLoaded实例本身是一个事件监听器，可以在上面绑定一些事件来做相应的处理。

* 版本：2.0.0
* 作者：秋知
* demo：[http://kg.kissyui.com/imagesLoaded/2.0.0/demo/index.html](http://kg.kissyui.com/imagesLoaded/2.0.0/demo/index.html)

## 初始化组件
		
    S.use('kg/imagesLoaded/2.0.0/index', function (S, ImagesLoaded) {
         var imagesLoaded = new ImagesLoaded({
            elem : container$,
            complete : function(imagesLoadedInstance){
				//图片列表加载完成，无论是否有图片加载失败
				//do something
            }
         });
    })
	
	
	
## API说明

### Configs

*elem* {String|HTMLElement|KISSY.Node} 需要监听的图片列表或其祖先节点

*options* {Object|Function} 可选。当为Object时表示‘自定义属性’，当为Function时，下面的'complete'配置则不需要，意义一样

*complete* {Function} 可选。图片列表加载完成后的回调函数，无论其中是否有图片出错


### Events

*complete* 
图片列表加载完成后触发，无论其中是否有图片出错。带入参数为ImagesLoaded实例本身

*fail* 
图片列表加载完成后，当其中有至少一张图片出错则触发。带入参数为ImagesLoaded实例本身

*done* 
图片列表加载完成后，并且没有一张图片出错则触发。带入参数为ImagesLoaded实例本身

*progress* 
图片列表中每一张图片加载成功或失败都会触发一次progress事件
    `imagesLoadedInstance.on('progress',onProgress);`

### Properties

*images* {Object[]} 
图片列表信息

*images[i].img* {HTMLElement}
图片列表中的某一个图片元素

*images[i].isLoaded* {Boolean}
图片列表中的某一个图片元素是否加载成功

*imagesCount* {Number}
监听的图片列表中的图片数量

*checkedCount* {Number}
图片列表中已经确认状态的图片数量

*hasAnyBroken* {Boolean}
图片列表中是否有至少一张图片加载失败

