import { useTranslation } from "../../lib/i18n";

function AddTransactionButton() {
  const { t } = useTranslation();

  return (
    <button
      className="
        w-full md:w-auto
        bg-blue-600
        hover:bg-blue-700
        text-white
        px-5
        py-3
        rounded-xl
        font-semibold
        transition
      "
    >
      + {t("transactions.add")}
    </button>
  )
}

export default AddTransactionButton