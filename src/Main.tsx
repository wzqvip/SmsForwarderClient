import { defineComponent, ref, computed } from 'vue';
import { useStorage } from '@vueuse/core';
import {
  NLayout,
  NLayoutContent,
  NLayoutSider,
  NButton,
  NSpace,
  NTabs,
  NTabPane,
  NList,
  NListItem,
} from 'naive-ui';
import ServerBlock from '@/components/ServerBlock.tsx';
import SmsDisplay from '@/components/SmsDisplay.tsx';
import CallLogDisplay from '@/components/CallLogDisplay.tsx';
import ContactDisplay from '@/components/ContactDisplay.tsx';
import ToolsDisplay from '@/components/ToolsDisplay.tsx';
import AddServerForm from '@/components/AddServerForm.tsx';
import SendSmsForm from '@/components/SendSmsForm.tsx';

export default defineComponent({
  setup() {
    const servers = useStorage<Server[]>('servers', []);
    const selectedServerName = ref('');
    const selectedServer = computed(() => servers.value.find(it => it.name === selectedServerName.value));
    const addFormShow = ref(false);
    const sendFormShow = ref(false);

    return () => <NLayout position="absolute" has-sider>
      <NLayoutSider content-style="padding: 12px; display: flex; flex-direction: column; gap: 12px;">
        <NButton
          type="primary"
          block
          onClick={() => addFormShow.value = true}
        >添加服务器</NButton>
        <NList hoverable clickable style={{ flex: 1, overflowY: 'auto', background: 'transparent' }}>
          {servers.value.map(it => (
            <NListItem
              key={it.name}
              onClick={() => selectedServerName.value = it.name}
              style={{
                backgroundColor: selectedServerName.value === it.name ? 'var(--n-merged-color-hover, #f2f2f5)' : 'transparent',
                cursor: 'pointer',
                padding: '8px 12px',
                borderRadius: '8px',
                marginBottom: '4px',
                transition: 'background-color 0.2s',
                border: 'none',
              }}
            >
              <ServerBlock server={it} />
            </NListItem>
          ))}
        </NList>
      </NLayoutSider>
      {selectedServerName.value && <NLayoutContent>
        <NSpace vertical style={{ margin: '16px' }}>
          <NSpace>
            <NButton onClick={() => sendFormShow.value = true}>发送短信</NButton>
            <NButton
              onClick={() => {
                servers.value = servers.value.filter(it => it.name !== selectedServerName.value);
                selectedServerName.value = '';
              }}
            >删除</NButton>
          </NSpace>
          
          <NTabs type="line" animated>
            <NTabPane name="sms" tab="短信记录">
              <SmsDisplay server={selectedServer.value!} />
            </NTabPane>
            <NTabPane name="calls" tab="通话记录">
              <CallLogDisplay server={selectedServer.value!} />
            </NTabPane>
            <NTabPane name="contacts" tab="通讯录">
              <ContactDisplay server={selectedServer.value!} />
            </NTabPane>
            <NTabPane name="tools" tab="高级工具">
              <ToolsDisplay server={selectedServer.value!} />
            </NTabPane>
          </NTabs>
        </NSpace>
        <SendSmsForm v-model:show={sendFormShow.value} server={selectedServer.value!} />
      </NLayoutContent>}
      <AddServerForm v-model:show={addFormShow.value} add={server => servers.value.push(server)} />
    </NLayout>;
  },
});
