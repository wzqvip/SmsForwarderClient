import { defineComponent, watch, PropType, ref } from 'vue';
import { CallLog } from '@/types/api';
import api from '@/requests/api.ts';
import { NCard, NTime, NSpace, NSelect, NInput, NSpin, useMessage, NTag } from 'naive-ui';
import Right from '@/icons/right.svg';
import Left from '@/icons/left.svg';
import Sim from '@/icons/sim.svg';
import { useProgress } from '@marcoschulte/vue3-progress';

export default defineComponent({
  props: {
    server: { type: Object as PropType<Server>, required: true },
  },
  setup(props) {
    const page = ref(1);
    const allLoad = ref(false);
    const load = ref(false);
    const callLogs = ref<CallLog[]>([]);
    const typeFilter = ref(0);
    const phoneFilter = ref('');
    const progress = useProgress();
    const message = useMessage();

    const loadPage = async (reset = false) => {
      if (reset) {
        page.value = 1;
        callLogs.value = [];
        allLoad.value = false;
      }
      load.value = true;
      try {
        const data = await progress.attach(
          api.callLogs(
            props.server.host,
            props.server.secret,
            page.value,
            typeFilter.value,
            phoneFilter.value
          )
        );
        if (data.length === 0) {
          allLoad.value = true;
          if (page.value > 1) {
            message.info('已全部加载');
          }
        }
        callLogs.value.push(...data);
      }
      catch (e: any) {
        message.error(e.message || '获取通话记录失败');
      }
      load.value = false;
    };

    watch([() => props.server.host, typeFilter, phoneFilter], () => {
      loadPage(true);
    }, { immediate: true });

    const handleInfiniteOnLoad = () => {
      if (allLoad.value || load.value) return;
      page.value++;
      loadPage();
    };

    const typeOptions = [
      { label: '全部通话', value: 0 },
      { label: '呼入', value: 1 },
      { label: '呼出', value: 2 },
      { label: '未接', value: 3 },
    ];

    const getCallTypeTag = (type: number) => {
      switch (type) {
        case 1:
          return <NTag type="success" size="small">呼入</NTag>;
        case 2:
          return <NTag type="info" size="small">呼出</NTag>;
        case 3:
          return <NTag type="error" size="small">未接</NTag>;
        default:
          return <NTag size="small">未知</NTag>;
      }
    };

    const formatDuration = (seconds: number) => {
      if (seconds === 0) return '未接通';
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return m > 0 ? `${m}分${s}秒` : `${s}秒`;
    };

    return () => (
      <NSpace vertical style={{ width: '100%' }}>
        <NSpace style={{ marginBottom: '10px' }}>
          <NSelect
            style={{ width: '120px' }}
            options={typeOptions}
            v-model:value={typeFilter.value}
          />
          <NInput
            placeholder="搜索手机号"
            v-model:value={phoneFilter.value}
            clearable
          />
        </NSpace>
        
        <NSpace
          vertical
          v-infinite-scroll={handleInfiniteOnLoad}
          infinite-scroll-distance={50}
        >
          {callLogs.value.map((it, idx) => (
            <NCard key={idx} title={it.name || '未知号码'}>
              {{
                'header-extra': () => (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {getCallTypeTag(it.type)}
                    <span style={{ fontSize: '12px', color: '#999' }}>{it.number}</span>
                    <Sim style={{ width: '14px', height: '14px', marginLeft: '4px' }} />
                    <span style={{ fontSize: '12px' }}>{it.sim_id === -1 ? '?' : it.sim_id}</span>
                  </div>
                ),
                default: () => (
                  <div style={{ color: '#555' }}>
                    通话时长：{formatDuration(it.duration)}
                  </div>
                ),
                footer: () => <NTime time={new Date(it.dateLong)} />,
              }}
            </NCard>
          ))}
          {load.value && <NSpin style={{ width: '100%', margin: '20px 0' }} />}
          {!load.value && callLogs.value.length === 0 && (
            <div style={{ textAlign: 'center', padding: '30px', color: '#999' }}>暂无通话记录</div>
          )}
        </NSpace>
      </NSpace>
    );
  },
});
