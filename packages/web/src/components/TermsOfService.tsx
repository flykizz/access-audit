import { Box, Typography, Container } from '@mui/material';
import { Link } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';

function TermsOfService() {
  const theme = useTheme();

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: theme.palette.background.default }}>
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: 24 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="4" width="24" height="24" rx="6" fill="#6366f1" />
              <path d="M12 12l8 4-8 4V12z" fill="white" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <Typography variant="h6" sx={{ ml: 2, fontSize: '1.25rem', fontWeight: 700, color: theme.palette.text.primary }}>
              AccessAudit
            </Typography>
          </Box>
        </Link>

        <Typography variant="h1" sx={{ fontSize: '2.5rem', fontWeight: 700, mb: 6, color: theme.palette.text.primary }}>
          服务条款
        </Typography>

        <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 8, fontSize: '1.125rem' }}>
          最后更新: 2026年7月25日
        </Typography>

        <Box sx={{ mb: 8 }}>
          <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 4, color: theme.palette.text.primary }}>
            1. 引言
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 4, lineHeight: 1.8 }}>
            本服务条款（"条款"）管辖您对 AccessAudit 网站、Web 应用、API 及相关服务（"服务"）的访问和使用。通过访问或使用我们的服务，您同意受本条款约束。
          </Typography>
        </Box>

        <Box sx={{ mb: 8 }}>
          <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 4, color: theme.palette.text.primary }}>
            2. 账户注册
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 4, lineHeight: 1.8 }}>
            要使用我们服务的某些功能，您必须注册一个账户。您同意在注册过程中提供准确、完整和最新的信息，并更新此类信息以保持其准确、完整和最新。您负责保护您的密码以及您账户下的任何活动或操作。
          </Typography>
        </Box>

        <Box sx={{ mb: 8 }}>
          <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 4, color: theme.palette.text.primary }}>
            3. 服务使用
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 4, lineHeight: 1.8 }}>
            您只能出于合法目的并按照本条款使用我们的服务。您同意不使用我们的服务：
          </Typography>
          <ul>
            {[
              '以任何违反适用的国家或国际法律或法规的方式。',
              '未经我们事先书面同意，发送或促成发送任何广告或促销材料。',
              '冒充或试图冒充 AccessAudit、AccessAudit 员工、其他用户或任何其他个人或实体。',
              '从事任何其他限制或阻碍任何人使用或享受服务的行为，或根据我们的判断，可能损害 AccessAudit 或服务用户或使他们承担责任的行为。',
            ].map((item, index) => (
              <li key={index}>
                <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 2, lineHeight: 1.8, pl: 2 }}>
                  {item}
                </Typography>
              </li>
            ))}
          </ul>
        </Box>

        <Box sx={{ mb: 8 }}>
          <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 4, color: theme.palette.text.primary }}>
            4. API 使用
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 4, lineHeight: 1.8 }}>
            如果您使用我们的 API，您同意遵守 API 文档以及我们可能设定的任何速率限制。您不得使用我们的 API：
          </Typography>
          <ul>
            {[
              '进行过多的 API 调用，扰乱我们的服务。',
              '将 API 用于与您的应用程序集成无关的任何目的。',
              '反向工程或试图反向工程我们的 API。',
            ].map((item, index) => (
              <li key={index}>
                <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 2, lineHeight: 1.8, pl: 2 }}>
                  {item}
                </Typography>
              </li>
            ))}
          </ul>
        </Box>

        <Box sx={{ mb: 8 }}>
          <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 4, color: theme.palette.text.primary }}>
            5. 费用与支付
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 4, lineHeight: 1.8 }}>
            我们可能对服务的某些功能收取费用。除非另有说明，所有费用均不予退还。您同意支付与您使用服务相关的所有费用。我们可能随时更改费用，但会提前通知您。
          </Typography>
        </Box>

        <Box sx={{ mb: 8 }}>
          <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 4, color: theme.palette.text.primary }}>
            6. 知识产权
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 4, lineHeight: 1.8 }}>
            服务以及包含在服务中或通过服务提供的所有内容，例如文本、图形、徽标、图像和软件，均为 AccessAudit 或其授权方的财产，并受版权和其他知识产权法律的保护。未经我们事先书面同意，您不得复制、复制、分发或从任何内容创建衍生作品。
          </Typography>
        </Box>

        <Box sx={{ mb: 8 }}>
          <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 4, color: theme.palette.text.primary }}>
            7. 终止
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 4, lineHeight: 1.8 }}>
            如果您违反本条款或出于任何其他原因，我们可能随时终止或暂停您的账户和对服务的访问，恕不另行通知或承担责任。终止后，您使用服务的权利将立即终止。
          </Typography>
        </Box>

        <Box sx={{ mb: 8 }}>
          <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 4, color: theme.palette.text.primary }}>
            8. 免责声明
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 4, lineHeight: 1.8 }}>
            服务按"原样"和"可用"提供，不提供任何形式的保证，明示或暗示。我们不保证服务将不间断、安全或无错误。
          </Typography>
        </Box>

        <Box sx={{ mb: 8 }}>
          <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 4, color: theme.palette.text.primary }}>
            9. 责任限制
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 4, lineHeight: 1.8 }}>
            在任何情况下，AccessAudit 均不对因您使用服务而产生的任何间接、附带、特殊或后果性损害承担责任。
          </Typography>
        </Box>

        <Box sx={{ mb: 8 }}>
          <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 4, color: theme.palette.text.primary }}>
            10. 条款变更
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 4, lineHeight: 1.8 }}>
            我们可能不时更新这些条款。我们将通过在我们的网站上发布新条款来通知您任何变更。在新条款生效日期后，您继续使用服务即表示您接受变更。
          </Typography>
        </Box>

        <Box sx={{ mb: 8 }}>
          <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 4, color: theme.palette.text.primary }}>
            11. 联系我们
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 4, lineHeight: 1.8 }}>
            如果您对这些条款有任何疑问，请通过 support@accessaudit.com 联系我们。
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default TermsOfService;