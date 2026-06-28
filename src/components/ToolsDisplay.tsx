import { defineComponent, watch, PropType, ref } from 'vue';
import { Battery, LocationInfo, ServerConfig } from '@/types/api';
import api from '@/requests/api.ts';
import {
  NCard,
  NSpace,
  NButton,
  NDescriptions,
  NDescriptionsItem,
  NForm,
  NFormItem,
  NInput,
  NGrid,
  NGi,
  NTag,
  NSpin,
  useMessage,
} from 'naive-ui';
import { useProgress } from '@marcoschulte/vue3-progress';

export default defineComponent({
  props: {
    server: { type: Object as PropType<Server>, required: true },
  },
  setup(props) {
    const progress = useProgress();
    const message = useMessage();

    const config = ref<ServerConfig | null>(null);
    const battery = ref<Battery | null>(null);
    const location = ref<LocationInfo | null>(null);

    const configLoad = ref(false);
    const batteryLoad = ref(false);
    const locationLoad = ref(false);
    const wolLoad = ref(false);

    // WOL form
    const wolForm = ref({
      mac: '',
      ip: '',
      port: 9,
    });

    const loadConfig = async () => {
      configLoad.value = true;
      try {
        const data = await progress.attach(api.config(props.server.host, props.server.secret));
        config.value = data;
      } catch (e: any) {
        message.error('获取配置失败: ' + e.message);
      }
      configLoad.value = false;
    };

    const loadBattery = async () => {
      batteryLoad.value = true;
      try {
        const data = await progress.attach(api.battery(props.server.host, props.server.secret));
        battery.value = data;
      } catch (e: any) {
        message.error('获取电量失败: ' + e.message);
      }
      batteryLoad.value = false;
    };

    const loadLocation = async () => {
      locationLoad.value = true;
      try {
        const data = await progress.attach(api.location(props.server.host, props.server.secret));
        location.value = data;
      } catch (e: any) {
        console.warn('获取定位失败:', e);
      }
      locationLoad.value = false;
    };

    const sendWol = async () => {
      if (!wolForm.value.mac) {
        message.warning('请输入MAC地址');
        return;
      }
      wolLoad.value = true;
      try {
        const res = await progress.attach(
          api.wol(
            props.server.host,
            props.server.secret,
            wolForm.value.mac,
            wolForm.value.ip || undefined,
            wolForm.value.port
          )
        );
        message.success(res || 'WOL发送成功');
      } catch (e: any) {
        message.error('发送WOL失败: ' + e.message);
      }
      wolLoad.value = false;
    };

    watch([() => props.server.host, () => props.server.secret], () => {
      loadConfig();
      loadBattery();
      loadLocation();
    }, { immediate: true });

    return () => (
      <NGrid cols="1 m:2" x-gap="16" y-gap="16" responsive="screen">
        {/* Device Config & Info */}
        <NGi>
          <NSpin show={configLoad.value}>
            <NCard title="设备配置与状态" size="small" style={{ height: '100%' }}>
              {{
                'header-extra': () => (
                  <NButton size="small" onClick={loadConfig}>刷新</NButton>
                ),
                default: () => config.value ? (
                  <NSpace vertical>
                    <NDescriptions label-placement="left" bordered column={1} size="small">
                      <NDescriptionsItem label="设备备注">
                        {config.value.extra_device_mark || '未设置'}
                      </NDescriptionsItem>
                      <NDescriptionsItem label="SIM1卡槽">
                        {config.value.extra_sim1 || '未设置'}
                      </NDescriptionsItem>
                      <NDescriptionsItem label="SIM2卡槽">
                        {config.value.extra_sim2 || '未设置'}
                      </NDescriptionsItem>
                    </NDescriptions>
                    
                    <div style={{ marginTop: '10px' }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>API 接口功能开启状态:</div>
                      <NSpace wrap>
                        <NTag type={config.value.enable_api_sms_send ? 'success' : 'warning'}>
                          发送短信: {config.value.enable_api_sms_send ? '开启' : '关闭'}
                        </NTag>
                        <NTag type={config.value.enable_api_sms_query ? 'success' : 'warning'}>
                          查询短信: {config.value.enable_api_sms_query ? '开启' : '关闭'}
                        </NTag>
                        <NTag type={config.value.enable_api_call_query ? 'success' : 'warning'}>
                          查询通话: {config.value.enable_api_call_query ? '开启' : '关闭'}
                        </NTag>
                        <NTag type={config.value.enable_api_contact_query ? 'success' : 'warning'}>
                          查询通讯录: {config.value.enable_api_contact_query ? '开启' : '关闭'}
                        </NTag>
                        <NTag type={config.value.enable_api_battery_query ? 'success' : 'warning'}>
                          查询电量: {config.value.enable_api_battery_query ? '开启' : '关闭'}
                        </NTag>
                        <NTag type={config.value.enable_api_wol ? 'success' : 'warning'}>
                          远程WOL: {config.value.enable_api_wol ? '开启' : '关闭'}
                        </NTag>
                      </NSpace>
                    </div>
                  </NSpace>
                ) : (
                  <div style={{ color: '#999', textAlign: 'center', padding: '20px' }}>暂无配置数据</div>
                )
              }}
            </NCard>
          </NSpin>
        </NGi>

        {/* Battery Info */}
        <NGi>
          <NSpin show={batteryLoad.value}>
            <NCard title="电池状态" size="small" style={{ height: '100%' }}>
              {{
                'header-extra': () => (
                  <NButton size="small" onClick={loadBattery}>刷新</NButton>
                ),
                default: () => battery.value ? (
                  <NDescriptions label-placement="left" bordered column={2} size="small">
                    <NDescriptionsItem label="当前电量">{battery.value.level}</NDescriptionsItem>
                    <NDescriptionsItem label="电池状态">{battery.value.status}</NDescriptionsItem>
                    <NDescriptionsItem label="健康度">{battery.value.health}</NDescriptionsItem>
                    <NDescriptionsItem label="电源连接">{battery.value.plugged || '未连接'}</NDescriptionsItem>
                    <NDescriptionsItem label="电压">{battery.value.voltage || '未知'}</NDescriptionsItem>
                    <NDescriptionsItem label="温度">{battery.value.temperature || '未知'}</NDescriptionsItem>
                  </NDescriptions>
                ) : (
                  <div style={{ color: '#999', textAlign: 'center', padding: '20px' }}>暂无电池数据</div>
                )
              }}
            </NCard>
          </NSpin>
        </NGi>

        {/* Location Info */}
        <NGi>
          <NSpin show={locationLoad.value}>
            <NCard title="GPS 定位" size="small" style={{ height: '100%' }}>
              {{
                'header-extra': () => (
                  <NButton size="small" onClick={loadLocation}>刷新</NButton>
                ),
                default: () => location.value ? (
                  <NSpace vertical>
                    <NDescriptions label-placement="left" bordered column={1} size="small">
                      <NDescriptionsItem label="定位时间">{location.value.time}</NDescriptionsItem>
                      <NDescriptionsItem label="经纬度">{location.value.latitude}, {location.value.longitude}</NDescriptionsItem>
                      <NDescriptionsItem label="位置信息">{location.value.address || '未知地址'}</NDescriptionsItem>
                      <NDescriptionsItem label="定位源">{location.value.provider || '未知'}</NDescriptionsItem>
                    </NDescriptions>
                    <NSpace>
                      <NButton
                        size="small"
                        type="info"
                        ghost
                        onClick={() => {
                          window.open(`https://uri.amap.com/marker?position=${location.value?.longitude},${location.value?.latitude}&name=设备位置`);
                        }}
                      >
                        在高德地图中查看
                      </NButton>
                      <NButton
                        size="small"
                        type="success"
                        ghost
                        onClick={() => {
                          window.open(`https://www.google.com/maps/search/?api=1&query=${location.value?.latitude},${location.value?.longitude}`);
                        }}
                      >
                        在谷歌地图中查看
                      </NButton>
                    </NSpace>
                  </NSpace>
                ) : (
                  <div style={{ color: '#999', textAlign: 'center', padding: '20px' }}>暂无定位数据</div>
                )
              }}
            </NCard>
          </NSpin>
        </NGi>

        {/* WOL tool */}
        <NGi>
          <NSpin show={wolLoad.value}>
            <NCard title="远程网络唤醒 (WOL)" size="small" style={{ height: '100%' }}>
              <NForm size="small">
                <NFormItem label="网卡 MAC 地址" required>
                  <NInput v-model:value={wolForm.value.mac} placeholder="e.g. 1A:2B:3C:4D:5E:6F" />
                </NFormItem>
                <NFormItem label="内网广播 IP 地址 (可选)">
                  <NInput v-model:value={wolForm.value.ip} placeholder="e.g. 192.168.1.255" />
                </NFormItem>
                <NFormItem label="端口 (通常为 7 或 9)">
                  <NInput v-model:value={wolForm.value.port} type="text" placeholder="9" />
                </NFormItem>
                <NButton type="primary" onClick={sendWol}>发送唤醒魔包</NButton>
              </NForm>
            </NCard>
          </NSpin>
        </NGi>
      </NGrid>
    );
  },
});
