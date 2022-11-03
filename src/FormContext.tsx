import * as React from 'react';
import type { ValidateMessages, FormInstance, FieldData, Store } from './interface';

export type Forms = Record<string, FormInstance>;

export interface FormChangeInfo {
  changedFields: FieldData[];
  forms: Forms;
}

export interface FormFinishInfo {
  values: Store;
  forms: Forms;
}

export interface FormProviderProps {
  validateMessages?: ValidateMessages;
  onFormChange?: (name: string, info: FormChangeInfo) => void;
  onFormFinish?: (name: string, info: FormFinishInfo) => void;
  children?: React.ReactNode;
}

export interface FormContextProps extends FormProviderProps {
  triggerFormChange: (name: string, changedFields: FieldData[]) => void;
  triggerFormFinish: (name: string, values: Store) => void;
  registerForm: (name: string, form: FormInstance) => void;
  unregisterForm: (name: string) => void;
}

// 传递context
const FormContext = React.createContext<FormContextProps>({
  triggerFormChange: () => {},
  triggerFormFinish: () => {},
  registerForm: () => {},
  unregisterForm: () => {},
});

const FormProvider: React.FunctionComponent<FormProviderProps> = ({
  validateMessages,
  onFormChange,
  onFormFinish,
  children,
}) => {
  // 函数式 获取context 数据
  const formContext = React.useContext(FormContext);

  const formsRef = React.useRef<Forms>({});

  return (
    <FormContext.Provider
      value={{
        ...formContext,
        validateMessages: {
          ...formContext.validateMessages,
          ...validateMessages,
        },

        // =========================================================
        // =                  Global Form Control                  =
        // =========================================================
        triggerFormChange: (name, changedFields) => {
          // 如果注册的有FormChange事件 ，则在字段改变时调用
          if (onFormChange) {
            onFormChange(name, {
              changedFields,
              forms: formsRef.current,
            });
          }

          formContext.triggerFormChange(name, changedFields);
        },
        triggerFormFinish: (name, values) => {
          // 如果注册的有onFormFinish事件 ，则在表单完成时调用
          if (onFormFinish) {
            onFormFinish(name, {
              values,
              forms: formsRef.current,
            });
          }

          formContext.triggerFormFinish(name, values);
        },
        // 注册表单
        registerForm: (name, form) => {
          // 存在name 属性 注册form
          if (name) {
            formsRef.current = {
              ...formsRef.current,
              [name]: form,
            };
          }

          formContext.registerForm(name, form);
        },
        // 取消注册 表单
        unregisterForm: name => {
          const newForms = { ...formsRef.current };
          // 删除注册的form
          delete newForms[name];
          formsRef.current = newForms;

          formContext.unregisterForm(name);
        },
      }}
    >
      {children}
    </FormContext.Provider>
  );
};

export { FormProvider };

export default FormContext;
