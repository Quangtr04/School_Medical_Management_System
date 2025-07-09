import TitleSection from "../../Admin-component/Admin-OverView/TitleSection";
import DashboardCards from "../../Admin-component/Admin-OverView/DashboardCards";
import DashboardCharts from "../../Admin-component/Admin-OverView/DashBoardChart";
import DashboardActivity from "../../Admin-component/Admin-OverView/DashboardActivity";

function AdminOverViewPage() {
  return (
    <div>
      <TitleSection />
      <DashboardCards />
      <DashboardCharts />
      <DashboardActivity />
    </div>
  );
}

export default AdminOverViewPage;
