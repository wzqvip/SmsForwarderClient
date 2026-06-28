import { computed, defineComponent, PropType, ref, watch } from 'vue';
import { FormInst, NButton, NCard, NForm, NFormItem, NInput, NModal } from 'naive-ui';

export default defineComponent({
  props: {
    show: { type: Boolean },
    server: { type: Object as PropType<Server> },
    save: { type: Function as PropType<(oldName: string, server: Server) => any>, required: true },
  },
  setup(props, { emit }) {
    const show = computed({
      get: () => props.show,
      set: (value) => emit('update:show', value),
    });
    
    const form = ref({
      name: '',
      host: '',
      secret: '',
    });
    
    const formRef = ref<FormInst>();
    const rules = {
      name: {
        required: true,
        message: '请输入名称',
        trigger: 'blur',
      },
      host: {
        required: true,
        message: '请输入地址',
        trigger: 'blur',
      },
    };

    watch(() => props.server, (newVal) => {
      if (newVal) {
        form.value = {
          name: newVal.name,
          host: newVal.host,
          secret: newVal.secret || '',
        };
      }
    }, { immediate: true });

    const handleSave = () => {
      formRef.value?.validate(errors => {
        if (!errors && props.server) {
          props.save(props.server.name, form.value);
          show.value = false;
        }
      });
    };

    return () => <NModal
      v-model:show={show.value}
    >
      <NCard
        style="width: 50vw"
        title="修改服务器配置"
        size="huge"
        role="dialog"
        aria-modal="true"
      >
        {{
          default: () => <NForm rules={rules} model={form.value} ref={formRef}>
            <NFormItem label="名称" path="name">
              <NInput
                //@ts-ignore
                vModel:value={form.value.name}
              />
            </NFormItem>
            <NFormItem label="地址" path="host">
              <NInput
                //@ts-ignore
                vModel:value={form.value.host}
              />
            </NFormItem>
            <NFormItem label="密钥 (可选)" path="secret">
              <NInput
                type="password"
                show-password-on="click"
                placeholder="服务器“安全设置”开启了“校验签名”时填写"
                //@ts-ignore
                vModel:value={form.value.secret}
              />
            </NFormItem>
          </NForm>,
          footer: () => <NButton onClick={handleSave}>
            保存
          </NButton>,
        }}
      </NCard>
    </NModal>;
  },
});
