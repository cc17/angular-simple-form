#angular-simple-form

> 通过配置form表单所需model，自动完成视图的渲染。支持常用表单类型，可进行双向绑定。每个表单元素可以传递多个validator及errormessage。validator必须一个directive的名字，通过此方式，可以复用。

## model配置
```js
//model配置

$scope.formFields = [
          {
            key: 'teststatic',
            type:"static",
            value:'这里显示静态内容',
            label: '文本框：'
          },
          {
            type:"date",
            label: '日期选择：',
            startKey:'startTime',
            endKey:'endTime2'
          },
          {
            key: 'test',
            type:"text",
            value:'',
            label: '文本框：',
            description: '这里可以是一些描述',
            labelWidth:'col-sm-2',
            formItemWidth:'col-sm-4',
            attributes:['value-min=10','value-max=20'],
            validators:[
              {
                'validator':'simpleFormTestValid="5"',
                'errorMessage':'长度不少于5'
              }
            ]
          },
          {
            key: 'custom',
            type:"custom",
            required:true,
            templateUrl:'scripts/template/formFields/formly-field-text.html',
            label: 'custom',
            description: 'To reveal something secret...'
          },
          {
          	key: 'radioKey',
          	type: 'radio',
          	label: '单选框：',
          	options: [
          		{
          			name: 'Yes, and I love it!',
          			value: 'yesyes'
          		}, {
          			name: 'Yes, but I\'m not a fan...',
          			value: 'yesno'
          		}, {
          			name: 'Nope',
          			value: 'no',
                    checked:true
          		}
          	]
          },
          {
          	key: 'love',
          	type: 'number',
          	label: '数字类型：',
          	min: 0,
          	max: 100,
          	required: true
          },
          {
          	key: 'transportation',
          	type: 'select',
          	label: 'How do you get around in the city',
          	options: [
          		{
          			name: 'Car',
          			value: 'car'
          		}
          	]
          },
          {
          	key: 'password',
          	type: 'password',
          	label: 'Password'
          },
          {
          	key: 'repeatPassword',
          	type: 'password',
          	label: 'Repeat Password'
          },
          {
          	key: 'checkboxItem',
          	type: 'checkbox',
          	label: '复选框：',
          	description: 'To reveal something secret...',
            options: [
              {
                name: "name0",
                value:'value0'
              },
              {
                name: "name1",
                value:'value1'
              },
              {
                name: "name2",
                value:'value2'
              }
            ]
          },
          {
          	key: 'about',
          	type: 'textarea',
          	label: 'Tell me about yourself',
          	placeholder: 'I like puppies',
          	lines: 4
          },
          {
            key:'提交',
            type:'submit',
            label:""
          }
        ];


        $scope.formConfig = {
          //uniqueFormId: 'myForm'
        };
        //组装表单提交数据

        $scope.formData = {
          test:'nihao',
          radioKey:'yesyes',
          //select这个值等于formFileld传值时select的某项value值
          transportation:'car'
        };

        //submit
        $scope.onSubmit9999 = function(result){
          console.log(result);
        };
```

##view视图最后会渲染成：
