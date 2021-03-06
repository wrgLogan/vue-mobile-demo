import axios from 'axios';

var WxSdk = function() {
    this.jsApiList = null;
    this.configOptions = null; // 微信初始化配置项
    this.configIsReady = false;
}

// 默认开启所有接口
WxSdk.prototype.defaultJsApiList = [
    "openEnterpriseChat",
    "openEnterpriseContact",
    "onMenuShareTimeline",    // 分享到朋友圈
    "onMenuShareAppMessage",  // 分享给好友
    "onMenuShareQQ",
    "onMenuShareWeibo",
    "onMenuShareQZone",
    "startRecord",
    "stopRecord",
    "onVoiceRecordEnd",
    "playVoice",
    "pauseVoice",
    "stopVoice",
    "onVoicePlayEnd",
    "uploadVoice",
    "downloadVoice",
    "chooseImage",
    "previewImage",
    "uploadImage",
    "downloadImage",
    "translateVoice",
    "getNetworkType",
    "openLocation",
    "getLocation",
    "hideOptionMenu",
    "showOptionMenu",
    "hideMenuItems",  // 隐藏菜单
    "showMenuItems",  // 打开菜单
    "hideAllNonBaseMenuItem", // 隐藏所有菜单
    "showAllNonBaseMenuItem", // 打开所有菜单
    "closeWindow",
    "scanQRCode"
]

// wxsdk.apiTicket('http://healthtest.minshenglife.com/rest/v0)
WxSdk.prototype.apiTicket = function(url, _callback) {
    var wxsdk = this;
    var data = window.location.origin + location.pathname + location.search;
    
    axios.post(url, {data: data}).then(res => {
        var data = res.data;
        
        if (data.appId) {
            wxsdk.configOptions = data;
            this.configOptions.debug = false;
            wxsdk.configWxApis(_callback);
        }
    });
}

WxSdk.prototype.configWxApis = function(_callback) {
    var jsApiList = this.jsApiList || this.defaultJsApiList;
    this.configOptions.jsApiList = jsApiList;

    console.log('配置微信初始化');
    
    wx.config({
        debug: this.configOptions.debug, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
        appId: this.configOptions.appId, // 必填，公众号的唯一标识
        timestamp: this.configOptions.timestamp, // 必填，生成签名的时间戳
        nonceStr: this.configOptions.noncestr, // 必填，生成签名的随机串
        signature: this.configOptions.sign,// 必填，签名，见附录1
        jsApiList: jsApiList // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
    });

    _callback && wx.ready(_callback);
}

// 配置默认分享
WxSdk.prototype.setDefaultShare = function(option) {
    this.defaultShareOption = option;
}

// 设置分享
WxSdk.prototype.configShare = function(option) {
    var wxsdk = this;
    var option = option || {};

    var title = option.title || this.defaultShareOption.title,
        desc = option.desc || this.defaultShareOption.desc,
        link = option.link || this.defaultShareOption.link,
        imgUrl = option.imgUrl || this.defaultShareOption.imgUrl;

    console.log('配置分享');
    console.log(title, desc, link, imgUrl);

    if (!wxsdk.configIsReady) {
        wx.ready(function() {
            setShare();
        })
    } else {
        setShare();
    }

    function setShare() {
        console.log('set share');
        wx.onMenuShareAppMessage({
            title: title,
            desc: desc,
            link: link,
            imgUrl: imgUrl,
            success: function() {
                wxsdk.onShareSuccess && wxsdk.onShareSuccess('appMessage');
            },
            cancel: function() {
                wxsdk.onShareCancel && wxsdk.onShareCancel('appMessage');
            }
        });
    
        wx.onMenuShareTimeline({
            title: title,
            link: link,
            imgUrl: imgUrl,
            success: function() {
                wxsdk.onShareSuccess && wxsdk.onShareSuccess('timeline');
            },
            cancel: function() {
                wxsdk.onShareCancel && wxsdk.onShareCancel('timeline');
            }
        });
    
        // 显示微信分享功能
        wx.showMenuItems({
            menuList: ['menuItem:share:appMessage', 'menuItem:share:timeline', 'menuItem:share:qq', 'menuItem:share:weiboApp', 'menuItem:share:facebook', 'menuItem:share:QZone'] // 要隐藏的菜单项，只能隐藏“传播类”和“保护类”按钮，所有menu项见附录3
        });
    }
    
}

// 关闭分享菜单
WxSdk.prototype.hideShareMemu = function() {
    wx.hideMenuItems({
        menuList: ['menuItem:share:appMessage', 'menuItem:share:timeline', 'menuItem:share:qq', 'menuItem:share:weiboApp', 'menuItem:share:facebook', 'menuItem:share:QZone'] // 要隐藏的菜单项，只能隐藏“传播类”和“保护类”按钮，所有menu项见附录3
    });
}

// 关闭别的浏览器打开
WxSdk.prototype.hideOuterBrowser = function() {
    wx.hideMenuItems({
        menuList: ['menuItem:openWithQQBrowser', 'menuItem:openWithSafari', 'menuItem:copyUrl']
    });
}

// 打开在别的浏览器打开菜单
WxSdk.prototype.openOuterBrowser = function() {
    wx.showMenuItems({
        menuList: ['menuItem:openWithQQBrowser', 'menuItem:openWithSafari', 'menuItem:copyUrl']
    })
}

var install = function(Vue, option) {
    var wxsdk = new WxSdk;
    Vue.prototype.$wxsdk = wxsdk;

    Vue.mixin({
        mounted: function() {
            if(this.$options.type == 'page') {
                var shareOption = this.$options.shareOption || wxsdk.defaultShareOption;
                wxsdk.configShare(shareOption);
            }
        }
    })
}

export default {
    install: install
};