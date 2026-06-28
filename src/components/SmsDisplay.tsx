import { defineComponent, watch, PropType, ref } from 'vue';
import { Sms } from '@/types/api';
import api from '@/requests/api.ts';
import { NCard, NTime, NSpace, NButton, useMessage, NSpin } from 'naive-ui';
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
    const sms = ref<Sms[]>([]);
    const error = ref('');
    const progress = useProgress();
    const message = useMessage();

    const sim1 = ref('');
    const sim2 = ref('');
    const simInfoMap = ref<Record<number, { slotIndex: number, label: string }>>({});

    const loadSimInfo = async () => {
      try {
        const config = await api.config(props.server.host, props.server.secret);
        const map: Record<number, { slotIndex: number, label: string }> = {};
        
        const sim1Remark = config.extra_sim1 || '';
        const sim2Remark = config.extra_sim2 || '';
        
        if (config.sim_info_list) {
          Object.values(config.sim_info_list).forEach((info) => {
            const slotIndex = info.sim_slot_index;
            const remark = slotIndex === 0 ? sim1Remark : (slotIndex === 1 ? sim2Remark : '');
            const carrier = info.carrier_name || '';
            
            let label = `SIM${slotIndex + 1}`;
            const details = [carrier, remark].filter(Boolean).join(' ');
            if (details) {
              label += ` (${details})`;
            }
            
            map[info.subscription_id] = {
              slotIndex,
              label,
            };
          });
        }
        
        simInfoMap.value = map;
        sim1.value = sim1Remark ? `SIM1 (${sim1Remark})` : 'SIM1';
        sim2.value = sim2Remark ? `SIM2 (${sim2Remark})` : 'SIM2';
      } catch (e) {
        console.error('Failed to load SIM info:', e);
      }
    };

    const loadPage = async () => {
      load.value = true;
      try {
        const data = await progress.attach(api.sms(props.server.host, props.server.secret, page.value));
        if (data.length === 0) {
          allLoad.value = true;
          message.info('已全部加载');
        }
        sms.value.push(...data);
        error.value = '';
      }
      catch (e: any) {
        message.error(e.message);
      }
      load.value = false;
    };

    watch([() => props.server.host, () => props.server.secret], async () => {
      sms.value = [];
      page.value = 1;
      allLoad.value = false;
      error.value = '';
      sim1.value = '';
      sim2.value = '';
      simInfoMap.value = {};
      loadSimInfo();
      await loadPage();
    }, { immediate: true });

    const handleInfiniteOnLoad = () => {
      if (allLoad.value) return;
      if (load.value) return;
      console.log('handleInfiniteOnLoad');
      page.value++;
      loadPage();
    };

    const getSimLabel = (simId: number, subId: number) => {
      if (subId !== undefined && simInfoMap.value[subId]) {
        return simInfoMap.value[subId].label;
      }
      if (simId === 0) {
        return sim1.value;
      }
      if (simId === 1) {
        return sim2.value;
      }
      return '?';
    };

    return () =>
      <NSpace
        vertical
        v-infinite-scroll={handleInfiniteOnLoad}
        infinite-scroll-distance={50}
      >{
        sms.value.map(it => <NCard title={it.name}>
          {{
            'header-extra': () => <div style={{ display: 'flex', 'align-items': 'center', 'gap': '4px' }}>
              {it.number}
              {it.type === 1 && <Right />}
              {it.type === 2 && <Left />}
              <Sim />
              <span style={{ fontSize: '12px' }}>{getSimLabel(it.sim_id, it.sub_id)}</span>
            </div>,
            default: () => it.content,
            footer: () => <NTime time={new Date(it.date)} />,
          }}
        </NCard>)
      }
        {load.value && <NSpin style={{ width: '100%' }} />}
      </NSpace>;
  },
});
