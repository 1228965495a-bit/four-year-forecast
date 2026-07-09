import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/game/PhoneFrame";
import { PixelButton3, PixelChip } from "@/components/pixel/PixelSkin";
import {
  PixelPanel,
  PixelCard,
  PixelInput,
  PixelTextarea,
  PixelTabs,
  PixelProgress,
  PixelBadge,
  PixelIconBox,
  PixelListItem,
  PixelDivider,
  PixelDialog,
  PixelToggle,
  PixelIconButton,
} from "@/components/pixel/PixelKit";

export const Route = createFileRoute("/ui")({
  component: UIKitPage,
  head: () => ({
    meta: [
      { title: "像素 UI 图鉴 · 我先替你读了四年" },
      { name: "description", content: "全套像素风 UI 组件预览：按钮、面板、卡片、输入框、进度条、徽章、对话框。" },
    ],
  }),
});

function UIKitPage() {
  const [tab, setTab] = useState<"a" | "b" | "c">("a");
  const [toggle, setToggle] = useState(true);
  const [dialog, setDialog] = useState(false);
  const [text, setText] = useState("");

  return (
    <PhoneFrame
      topBar={
        <div className="bg-ink text-cream px-3 py-3 border-b-[3px] border-ink">
          <div className="font-display text-[14px]">像素 UI 图鉴</div>
          <div className="text-[11px] text-cream/70 mt-0.5">全套零贴图组件预览</div>
        </div>
      }
    >
      <div className="p-3 space-y-4 pb-8 overflow-y-auto h-[calc(100dvh-98px)]">
        {/* 按钮 */}
        <PixelPanel title="按钮 Buttons">
          <div className="grid grid-cols-2 gap-2">
            <PixelButton3 variant="primary">主按钮</PixelButton3>
            <PixelButton3 variant="secondary">次按钮</PixelButton3>
            <PixelButton3 variant="danger">危险</PixelButton3>
            <PixelButton3 variant="option">选项</PixelButton3>
            <PixelButton3 variant="ghost">幽灵</PixelButton3>
            <PixelButton3 variant="primaryTall">高按钮</PixelButton3>
          </div>
          <div className="mt-3 flex gap-2 flex-wrap">
            <PixelChip>全部</PixelChip>
            <PixelChip active>热门</PixelChip>
            <PixelChip>工科</PixelChip>
            <PixelChip>人文</PixelChip>
          </div>
        </PixelPanel>

        {/* 图标按钮 & 徽章 */}
        <PixelPanel title="图标 & 徽章">
          <div className="flex flex-wrap items-center gap-2">
            <PixelIconButton tone="sunny">☰</PixelIconButton>
            <PixelIconButton tone="sage">✓</PixelIconButton>
            <PixelIconButton tone="cherry">♥</PixelIconButton>
            <PixelIconButton tone="sky">?</PixelIconButton>
            <PixelIconBox tone="parchment">📖</PixelIconBox>
            <PixelIconBox tone="sunny">☕</PixelIconBox>
            <PixelIconBox tone="sage">🌱</PixelIconBox>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <PixelBadge tone="sunny">S 级</PixelBadge>
            <PixelBadge tone="sage">稳定</PixelBadge>
            <PixelBadge tone="cherry">热门</PixelBadge>
            <PixelBadge tone="gold">★ 成就</PixelBadge>
            <PixelBadge tone="danger">危险</PixelBadge>
            <PixelBadge tone="ink">新</PixelBadge>
          </div>
        </PixelPanel>

        {/* Tabs */}
        <PixelPanel title="标签页 Tabs">
          <PixelTabs
            value={tab}
            onChange={setTab}
            options={[
              { value: "a", label: "全部" },
              { value: "b", label: "热门" },
              { value: "c", label: "挑战" },
            ]}
          />
          <div className="mt-2 text-[12px] text-ink/70">当前：{tab}</div>
        </PixelPanel>

        {/* 进度条 */}
        <PixelPanel title="进度条 Progress">
          <div className="space-y-2">
            <PixelProgress value={72} color="green" showValue />
            <PixelProgress value={45} color="red" />
            <PixelProgress value={60} color="blue" />
            <PixelProgress value={30} color="yellow" />
            <PixelProgress value={88} color="gold" showValue />
          </div>
        </PixelPanel>

        {/* 输入框 */}
        <PixelPanel title="输入 Input">
          <div className="space-y-2">
            <PixelInput placeholder="输入你的姓名…" />
            <PixelTextarea
              placeholder="留一句系统吐槽…"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="flex items-center gap-2">
              <span className="text-[12px]">通知</span>
              <PixelToggle checked={toggle} onChange={setToggle} />
              <span className="text-[11px] text-ink/60">{toggle ? "开" : "关"}</span>
            </div>
          </div>
        </PixelPanel>

        {/* 卡片 */}
        <PixelPanel title="卡片 Cards">
          <div className="space-y-2">
            <PixelCard tone="cream" selected>
              <div className="font-display text-[14px]">计算机科学与技术</div>
              <div className="text-[11px] text-ink/70">985 · 卷 · 高薪</div>
            </PixelCard>
            <PixelCard tone="sage">
              <div className="font-display text-[14px]">汉语言文学</div>
              <div className="text-[11px] text-ink/70">稳 · 就业向</div>
            </PixelCard>
            <PixelCard tone="sky">
              <div className="font-display text-[14px]">临床医学</div>
              <div className="text-[11px] text-ink/70">长线 · 学位深</div>
            </PixelCard>
          </div>
        </PixelPanel>

        {/* 列表 */}
        <PixelPanel title="菜单 List">
          <div className="space-y-2">
            <PixelListItem
              icon={<PixelIconBox tone="sunny">📖</PixelIconBox>}
              title="继续本科副本"
              hint="大二上 · 已进行 8 学期"
              right={<PixelBadge tone="cherry">继续</PixelBadge>}
            />
            <PixelListItem
              icon={<PixelIconBox tone="sage">🎓</PixelIconBox>}
              title="开始新存档"
              hint="重新选择专业"
            />
            <PixelListItem
              icon={<PixelIconBox tone="sky">⚙</PixelIconBox>}
              title="设置"
              hint="音效 / 字体 / 关于"
            />
          </div>
        </PixelPanel>

        <PixelDivider label="分隔" />

        {/* 对话框 */}
        <PixelPanel title="对话框 Dialog">
          <PixelButton3 variant="primary" onClick={() => setDialog(true)}>
            打开系统提示
          </PixelButton3>
        </PixelPanel>

        <PixelDialog
          open={dialog}
          onClose={() => setDialog(false)}
          title="系统记录"
          footer={
            <>
              <PixelButton3 variant="ghost" full={false} onClick={() => setDialog(false)}>
                取消
              </PixelButton3>
              <PixelButton3 variant="primary" full={false} onClick={() => setDialog(false)}>
                确认 →
              </PixelButton3>
            </>
          }
        >
          你选择了「翘课去打工」。
          <br />
          绩点 -3，钱包 +50，心情 +5。
        </PixelDialog>
      </div>
    </PhoneFrame>
  );
}
