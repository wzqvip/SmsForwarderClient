import { defineComponent, watch, PropType, ref } from 'vue';
import { Contact } from '@/types/api';
import api from '@/requests/api.ts';
import { NCard, NSpace, NInput, NSpin, useMessage, NButton, NModal, NForm, NFormItem, FormInst } from 'naive-ui';
import { useProgress } from '@marcoschulte/vue3-progress';

export default defineComponent({
  props: {
    server: { type: Object as PropType<Server>, required: true },
  },
  setup(props) {
    const contacts = ref<Contact[]>([]);
    const load = ref(false);
    const searchName = ref('');
    const searchPhone = ref('');
    const progress = useProgress();
    const message = useMessage();

    // Add contact form state
    const showAddModal = ref(false);
    const addFormRef = ref<FormInst>();
    const addForm = ref({
      name: '',
      phone_number: '',
    });
    const addRules = {
      name: { required: true, message: '请输入联系人姓名', trigger: 'blur' },
      phone_number: { required: true, message: '请输入手机号码', trigger: 'blur' },
    };

    const loadContacts = async () => {
      load.value = true;
      try {
        const data = await progress.attach(
          api.contacts(
            props.server.host,
            props.server.secret,
            searchName.value,
            searchPhone.value
          )
        );
        contacts.value = data || [];
      }
      catch (e: any) {
        message.error(e.message || '获取通讯录失败');
      }
      load.value = false;
    };

    watch([() => props.server.host, searchName, searchPhone], () => {
      loadContacts();
    }, { immediate: true });

    const handleAddContact = () => {
      addFormRef.value?.validate(async (errors) => {
        if (!errors) {
          try {
            await progress.attach(
              api.addContact(
                props.server.host,
                props.server.secret,
                addForm.value.name,
                addForm.value.phone_number
              )
            );
            message.success('添加联系人成功');
            showAddModal.value = false;
            addForm.value = { name: '', phone_number: '' };
            loadContacts(); // reload list
          }
          catch (e: any) {
            message.error(e.message || '添加联系人失败');
          }
        }
      });
    };

    return () => (
      <NSpace vertical style={{ width: '100%' }}>
        <NSpace style={{ marginBottom: '10px', justifyContent: 'space-between', width: '100%' }}>
          <NSpace>
            <NInput
              placeholder="搜索姓名"
              v-model:value={searchName.value}
              clearable
            />
            <NInput
              placeholder="搜索手机号"
              v-model:value={searchPhone.value}
              clearable
            />
          </NSpace>
          <NButton type="primary" onClick={() => showAddModal.value = true}>
            新增联系人
          </NButton>
        </NSpace>

        {load.value ? (
          <NSpin style={{ width: '100%', margin: '20px 0' }} />
        ) : contacts.value.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#999' }}>暂无联系人</div>
        ) : (
          <NSpace vertical>
            {contacts.value.map((it, idx) => (
              <NCard key={idx} hoverable>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{it.name}</span>
                  <span style={{ color: '#666' }}>{it.phone_number}</span>
                </div>
              </NCard>
            ))}
          </NSpace>
        )}

        <NModal v-model:show={showAddModal.value}>
          <NCard
            style={{ width: '400px' }}
            title="新增联系人"
            size="huge"
            role="dialog"
            aria-modal="true"
          >
            {{
              default: () => (
                <NForm ref={addFormRef} model={addForm.value} rules={addRules}>
                  <NFormItem label="姓名" path="name">
                    <NInput v-model:value={addForm.value.name} placeholder="请输入姓名" />
                  </NFormItem>
                  <NFormItem label="手机号" path="phone_number">
                    <NInput v-model:value={addForm.value.phone_number} placeholder="请输入手机号，多个分号隔开" />
                  </NFormItem>
                </NForm>
              ),
              footer: () => (
                <NSpace justify="end">
                  <NButton onClick={() => showAddModal.value = false}>取消</NButton>
                  <NButton type="primary" onClick={handleAddContact}>保存</NButton>
                </NSpace>
              ),
            }}
          </NCard>
        </NModal>
      </NSpace>
    );
  },
});
