(function(window, angular, undefined) {
  'use strict';

  

  var _uniqueId = new Date().getTime().toString(36);

  /*
  * 将驼峰转成中划线
  * */
  function convertCamelcaseToDash(value){
    return value.replace(/([A-Z])/g,function(str,match){
      return "-" + match.toLowerCase();;
    });
  };


  /**
   *
   * @type 定义一个hook，通过type查找dom元素
   */
  var fields = {
    'textarea':'textarea',
    'radio':'input',
    'select':'select',
    'number':'input',
    'checkbox':'input',
    'password':'input',
    'hidden':'input',
    'email':'input',
    'text':'input',
    'static':'static',
    'submit':'input'
  };
  /*
  * cache url
  * */
  var formlyUrlCache = (function(){
    var templateUrlMap = {};
    var templateMap = {};

    function setTemplateUrl(name, templateUrl) {
      if (typeof name === 'string') {
        templateUrlMap[name] = templateUrl;
      } else {
        angular.forEach(name, function(templateUrl, name) {
          setTemplateUrl(name, templateUrl);
        });
      }
    }
    function getTemplateUrl(type) {
      return templateUrlMap[type];
    }
    function setTemplate(name, template) {
      if (typeof name === 'string') {
        templateMap[name] = template;
      } else {
        angular.forEach(name, function(template, name) {
          setTemplate(name, template);
        });
      }
    }
    function getTemplate(type) {
      return templateMap[type];
    }
    return {
      getTemplateUrl : getTemplateUrl,
      setTemplateUrl : setTemplateUrl,
      getTemplate : getTemplate,
      setTemplate : setTemplate
    }
  })();

  


  angular.module('simpleFormModule',[])
    .provider('simpleForm',function(){
      var bower_component_path;
      this.setBowerComponentPath = function(path){
        bower_component_path = path;
      };
      this.getBowerComponentPath = function(){
        return bower_component_path || '/vendor';
      };

      this.$get = function(){
        return this;
      };
    })
    .directive('simpleForm', ['simpleForm',function formlyForm(simpleForm) {
      var bower_component_path = simpleForm.getBowerComponentPath();
      
      /**
       * 预定义模板路径
       */
      for(var key in fields){
        formlyUrlCache.setTemplateUrl(key, bower_component_path + '/simple-form/formFields/formly-field-' + key + '.html');
      }

      return {
        restrict: 'AE',
        templateUrl: bower_component_path + '/simple-form/formFields/simpleForm.html',
        replace: true,
        transclude: true,
        scope: {
          fields: '=',
          options: '=?',
          result: '=',
          formOnParentScope: '=name',
          onSubmit:'='
        },
        compile: function () {
          return {
            post: function (scope, ele, attr) {
              //Post gets called after angular has created the FormController
              //Now pass the FormController back up to the parent scope
              scope.formOnParentScope = scope[attr.name];
            }
          };
        },
        controller: ['$scope','$element','$parse',function($scope, $element, $parse) {

          //$scope.options.uniqueFormId = $scope.options.uniqueFormId || '';

        }]
      };
    }])

    .directive('formlyDynamicValue', function() {
      'use strict';
      return {
         restrict: 'AE',
         scope:{
           result:'=',
           options:'='
         },
         priority: 599, // one after ngIf
         link:function(scope,elem,attrs){
           elem.html(scope.result[scope.options.key]);
         }
      };
    })

    .directive('formlyDynamicName', function formlyDynamicName() {
      'use strict';
      return {
        restrict: 'AE',
        priority: 599, // one after ngIf
        controller:['$scope','$element','$attrs',function($scope, $element, $attrs) {
          $element.removeAttr('formly-dynamic-name');
          $attrs.$set('name', $scope.$eval($attrs.formlyDynamicName));
          delete $attrs.formlyDynamicName;
        }]
      };
    })

    .directive('formlyField', ['$http','$compile','$templateCache',function formlyField($http, $compile, $templateCache) {
      'use strict';
      return {
        restrict: 'AE',
        transclude: true,
        scope: {
          optionsData: '&options',
          formId: '=formId',
          index: '=index',
          result: '=formResult',
          //important:这里获取form表单整个作用域
          formScope:'=',
          onSubmitHandle:'='
        },
        link: function fieldLink($scope, $element,attrs) { 

          var template = $scope.options.template || formlyUrlCache.getTemplate($scope.options.type);
          var type = $scope.options.type;
          if (template) {
            setElementTemplate(template);
          } else {
            var templateUrl = $scope.options.templateUrl || formlyUrlCache.getTemplateUrl($scope.options.type);
            if (templateUrl) {
              $http.get(templateUrl, {
                cache: $templateCache
              }).then(function(response) {
                setElementTemplate(response.data);
              }, function(error) {
                console.warn('Formly Error: Problem loading template for ' + templateUrl, error);
              });
            } else {
              console.warn('Formly Error: template type \'' + $scope.options.type + '\' not supported.');
            }
          }
          function setElementTemplate(templateData) {
            $element.html(templateData);

            var $formItem = $element.contents().find(fields[type]);
            if($formItem.length){
              /**
               * 添加attribute
               */
              var attrs = $scope.options.attributes;
              if(attrs && attrs.length){
                var $formItem = $element.contents().find('input');
                angular.forEach(attrs,function(attr){
                  var attrMap = attr.split('=');
                  $formItem.attr(attrMap[0],attrMap[1] && attrMap[1].replace(/^["']|['"]$/g,'') || '');
                });
              }

              /**
               * 增加validator的directive
               */
              var validators = $scope.options.validators;
              if(validators && validators.length){
                if(!angular.isArray(validators)){
                  validators = [validators];
                }
                angular.forEach(validators, function(validator) {
                  var valiTemp = validator.validator.split('=');
                  $formItem.attr(convertCamelcaseToDash(valiTemp[0]), valiTemp[1] && valiTemp[1].replace(/^["']|['"]$/g,'') || '');
                });
              }
            }else{
              /**
               * 定义的标签找不到，什么都不做
               */
            }
            $compile($element.contents())($scope);
          }
        },
        controller: ['$scope',function($scope) {
          $scope.options = $scope.optionsData();
          var type = $scope.options.type.toLowerCase();

          if(type === 'submit'){
            $scope.onSubmit = function(result){
              $scope.onSubmitHandle.call(null,result);
            };
          }

          if (!type && $scope.options.template) {
            type = 'template';
          } else if (!type && $scope.options.templateUrl) {
            type = 'templateUrl';
          }

          if( (type === 'radio' || type === 'select' ) && Object.prototype.toString.call($scope.options.options) != '[object Array]'){
            throw new Error('options must be an Array');
          }

          /**
           * 如果未在result上定义model，而是通过formFields配置model，我们需要将其绑定到result上。
           */
          if(!$scope.result[$scope.options.key]){

            switch (type) {
              case 'text':
              case 'static':
                handleTypeWithText();
                break;
              case 'radio':
                handleTypeWithRadio();
                break;
              case 'checkbox':
                handleTypeWithCheckbox();
                break;
              case 'select':
                handleTypeWithSelect();
                break;
              default:
                break;
            }



          }
          // set field id to link labels and fields
          $scope.id = $scope.formId + type + $scope.index;

          $scope.$on('$destroy', function() {
            //TODO:为什么手动添加的“默认选择” ，从当前路由切到别的路由，再切回来时，没有自动清除？ 所以在此判断一下，手动清除，防止重复添加
            if(type === 'select'){
              var first = $scope.options.options[0];
              if(first.marker === '_self_add_' + _uniqueId){
                $scope.options.options = $scope.options.options.slice(1);
              }
            }
          });

          /***
           * handle function
           */

          function handleTypeWithText(){
            var obj = {};
            obj[$scope.options.key] = $scope.options.value;
            angular.extend($scope.result,obj);
          };


          function handleTypeWithRadio(){
            var obj = {};
            var filterItem =$scope.options.options.filter(function(option){
              return option.checked == true;
            });
            obj[$scope.options.key] = filterItem[0].value;
            angular.extend($scope.result,obj);
          };

          function handleTypeWithCheckbox(){
            var obj = {};
            obj[$scope.options.key] = {};
            angular.extend($scope.result,obj);
          };

          function handleTypeWithSelect(){
            var obj = {};
            var options = $scope.options.options;
            var selectedItem;
            for(var i= 0,len=options.length;i<len;i++){
              if(options[i].selected){
                selectedItem = options[i];
              }
            }
            var defaultOptions = $scope.options.defaultOptions;
            if(!selectedItem){
              $scope.options.options.unshift({name: (defaultOptions && defaultOptions.name) || '请选择',value:'',marker:'_self_add_' + _uniqueId});
              selectedItem = $scope.options.options[0];
            }
            obj[$scope.options.key] = selectedItem.value;
            angular.extend($scope.result,obj);
          };


        }]
      };
    }]);
})(window,angular)