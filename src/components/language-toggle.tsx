import { springPresets } from "@/lib/animations"
import { useI18n } from "@/lib/i18n/context"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

export function LanguageToggle() {
  const { localeCode, setLocale } = useI18n()

  return (
    <div className="relative flex items-center rounded-full border border-border/70 bg-secondary/35 p-0.5 text-xs font-medium leading-relaxed">
      {/* Sliding pill indicator */}
      <motion.div
        layoutId="language-toggle-indicator"
        className="absolute top-0.5 bottom-0.5 rounded-full bg-primary"
        transition={springPresets.snappy}
        style={{
          left: localeCode === "mm" ? "2px" : "50%",
          width: "calc(50% - 2px)",
        }}
      />

      <button
        type="button"
        lang="my"
        onClick={() => setLocale("mm")}
        className={cn(
          "relative z-10 rounded-full px-2.5 py-1 transition-colors leading-relaxed flex-1 text-center font-sans",
          localeCode === "mm"
            ? "text-primary-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        မြန်မာ
      </button>
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={cn(
          "relative z-10 rounded-full px-2.5 py-1 transition-colors leading-relaxed flex-1 text-center",
          localeCode === "en"
            ? "text-primary-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        EN
      </button>
    </div>
  )
}
